import { getHeroById, getAllHeroes } from '../data/heroes';
import { getItemById } from '../data/items';
import type { MatchRecord, DraftRecommendation } from '../types';
import { calculateFarmGap } from '../analytics/economyMath';
import { calculateWinProbability } from '../analytics/winProbability';

export type PlayStyle = 'Aggressive Carry' | 'Supportive' | 'Risky/Overextended' | 'Balanced';

export interface MatchAnalysisResult {
    kdaRatio: number;
    playStyle: PlayStyle;
    coachNote: string;
    incompatibleItemIds?: string[];   // item IDs causing the mismatch
    incompatibleEmblemId?: string;    // emblem ID that is role-incompatible
}

export class MLAnalyzer {
    /**
     * Analyzes a single match data immediately after submission to provide
     * instant feedback, styling, and a smart coach warning.
     */
    static analyzeMatch(heroId: string, kills: number, deaths: number, assists: number, itemIds: string[], emblemId?: string, _tier1Id?: string, _tier2Id?: string): MatchAnalysisResult {
        // 1. KDA Analizi
        const safeDeaths = deaths === 0 ? 1 : deaths;
        const kdaRatio = Number(((kills + assists) / safeDeaths).toFixed(2));

        // 2. Oyun Tarzı Belirleme (Heuristic ML Model)
        let playStyle: PlayStyle = 'Balanced';

        if (deaths >= 8 && kdaRatio < 1.5) {
            playStyle = 'Risky/Overextended';
        } else if (kills >= 8 && deaths <= 4 && kdaRatio >= 3.0) {
            playStyle = 'Aggressive Carry';
        } else if (assists >= 10 && kills <= 4) {
            playStyle = 'Supportive';
        } else if (kdaRatio >= 4.0) {
            playStyle = 'Aggressive Carry';
        } else if (deaths > kills + assists) {
            playStyle = 'Risky/Overextended';
        }

        // 3. Eşya & Rol Sinerjisi (Smart Warning)
        let coachNote = "Harika bir maç çıkardın. Mevcut eşya dizilimin ve tarzın dengeli.";
        const incompatibleItemIds: string[] = [];
        let incompatibleEmblemId: string | undefined;

        const hero = getHeroById(heroId);
        if (hero) {
            // Check synergy
            const items = itemIds.map(id => getItemById(id)).filter(Boolean) as import('../data/items').Item[];

            let hasIncompatibleItem = false;

            if (hero.damageType === 'Magic' && hero.roles.includes('Mage')) {
                items.forEach(item => {
                    if (item.category === 'Attack' && item.baseStats.physicalAttack) {
                        incompatibleItemIds.push(item.id);
                    }
                });
                if (incompatibleItemIds.length > 0) {
                    coachNote = "⚠️ Uyumsuz Eşya Dizilimi: Büyücü (Mage) kahramanına fiziksel hasar eşyası alınmış! Bu hasar potansiyelini düşürür.";
                    hasIncompatibleItem = true;
                }
            } else if (hero.damageType === 'Physical' && (hero.roles.includes('Fighter') || hero.roles.includes('Marksman'))) {
                items.forEach(item => {
                    if (item.category === 'Magic' || item.baseStats.magicPower) {
                        incompatibleItemIds.push(item.id);
                    }
                });
                if (incompatibleItemIds.length > 0) {
                    coachNote = "⚠️ Uyumsuz Eşya Dizilimi: Fiziksel hasar odaklı kahramana büyü eşyası alınmış! Eşya dizilimini gözden geçir.";
                    hasIncompatibleItem = true;
                }
            }

            // Amblem - kahraman rol uyumu kontrolü
            if (!hasIncompatibleItem && emblemId && emblemId !== 'common') {
                const emblemRoleMap: Record<string, string[]> = {
                    assassin: ['Assassin', 'Marksman', 'Fighter'],
                    mage: ['Mage', 'Support', 'Assassin'],
                    fighter: ['Fighter', 'Tank'],
                    marksman: ['Marksman'],
                    tank: ['Tank', 'Support', 'Fighter'],
                    support: ['Support', 'Mage', 'Tank'],
                };
                const goodRoles = emblemRoleMap[emblemId] ?? [];
                const isGoodEmblem = goodRoles.some(r => hero.roles.includes(r as import('../data/heroes').HeroRole));
                if (!isGoodEmblem) {
                    hasIncompatibleItem = true;
                    incompatibleEmblemId = emblemId;
                    coachNote = `⚠️ Amblem Uyumsuzluğu: "${emblemId}" amblemi bu kahraman için optimize değil. Bir sonraki maçta rol uyumlu bir amblem seç — bu hasar/hayatta kalma potansiyelini artırır.`;
                }
            }

            // Add advice based on playstyle if no synergy issues
            if (!hasIncompatibleItem) {
                if (playStyle === 'Risky/Overextended') {
                    coachNote = "Bu maç çok fazla hasar almış ve pozisyon hatası yapmış gibisin. Biraz daha haritayı (map) takip ederek defansif oynamanı tavsiye ederim.";
                } else if (playStyle === 'Aggressive Carry') {
                    coachNote = "Muazzam bir taşıyıcı performansı! Takımın için büyük bir hasar kaynağıydın, pozisyon almanı tebrik ediyorum.";
                } else if (playStyle === 'Supportive') {
                    coachNote = "Harika bir takım oyuncususun! Skor bırakıp asist yaparak takımının kazanmasında kritik bir rol oynadın.";
                }
            }
        } else {
            coachNote = "Kahraman verisi bulunamadı, ancak KDA oranına göre analiz yapıldı.";
        }

        return {
            kdaRatio,
            playStyle,
            coachNote,
            ...(incompatibleItemIds.length > 0 && { incompatibleItemIds }),
            ...(incompatibleEmblemId && { incompatibleEmblemId }),
        };
    }

    // ... (keep previous stubs or update them later)
    static analyzePlaystyle(): PlayStyle {
        return 'Balanced';
    }

    /**
     * AI-generated overall verdict based on a player's latest match history
     */
    static getRecommendations(matches: MatchRecord[], t: (key: string, options?: unknown) => string): string {
        if (matches.length === 0) return t('verdict_needs_data');

        const kdaRatios = matches.map(m => {
            const safeDeaths = m.deaths === 0 ? 1 : m.deaths;
            return (m.kills + m.assists) / safeDeaths;
        });

        const avgKda = kdaRatios.reduce((acc, val) => acc + val, 0) / matches.length;
        const totalDeaths = matches.reduce((acc, m) => acc + m.deaths, 0);
        const avgDeaths = totalDeaths / matches.length;

        let verdict = t('verdict_greeting', { count: matches.length });

        if (avgKda >= 4) {
            verdict += t('verdict_high_kda');
        } else if (avgKda < 1.5) {
            verdict += t('verdict_low_kda');
        }

        if (avgDeaths >= 6) {
            verdict += t('verdict_high_deaths');
        }

        const supportTags = matches.filter(m => m.playstyle_tag === 'Supportive' || m.playstyle_tag === 'Takım Destekçisi').length;
        if (supportTags > matches.length / 2) {
            verdict += t('verdict_supportive');
        }

        const winCount = matches.filter(m => m.result === 'Victory').length;
        const lossCount = matches.length - winCount;

        if (lossCount > winCount && lossCount >= 3) {
            verdict += t('verdict_losing_streak');
        }

        return verdict;
    }

    /**
     * Generate 0-100 score metrics for the Playstyle Radar Chart
     */
    static computeRadarMetrics(matches: MatchRecord[]) {
        if (matches.length === 0) {
            return [
                { subject: 'Saldırganlık (Skor)', A: 0, fullMark: 100 },
                { subject: 'Hayatta Kalma', A: 0, fullMark: 100 },
                { subject: 'Takım Oyunu', A: 0, fullMark: 100 },
                { subject: 'Farming (Altın)', A: 0, fullMark: 100 },
                { subject: 'İstikrar (Kazanma)', A: 0, fullMark: 100 },
            ];
        }

        const totalKills = matches.reduce((acc, m) => acc + m.kills, 0);
        const totalDeaths = matches.reduce((acc, m) => acc + m.deaths, 0);
        const totalAssists = matches.reduce((acc, m) => acc + m.assists, 0);
        const wins = matches.filter(m => m.result === 'Victory').length;

        const avgKills = totalKills / matches.length;
        const avgDeaths = totalDeaths / matches.length;
        const avgAssists = totalAssists / matches.length;
        const winRate = (wins / matches.length) * 100;

        // Saldırganlık: 8 ortalama kill 100 puan
        const aggressiveness = Math.min(100, Math.round((avgKills / 8) * 100));

        // Hayatta Kalma: 0 ölüm 100 puan, 8 ölüm 0 puan
        const survivability = Math.max(0, 100 - Math.round((avgDeaths / 8) * 100));

        // Takım Oyunu: 10 ortalama asist 100 puan
        const teamwork = Math.min(100, Math.round((avgAssists / 10) * 100));

        // İstikrar: %50 üzeri kazanma ekstra puan
        const stability = Math.round(winRate);

        // Farming: Eşya sayısına göre (basit bir approximation)
        const avgItems = matches.reduce((acc, m) => acc + m.items.length, 0) / matches.length;
        const farming = Math.min(100, Math.round((avgItems / 6) * 100)); // 6 eşya = full build

        return [
            { subject: 'Saldırganlık', A: aggressiveness, fullMark: 100 },
            { subject: 'Hayatta Kalma', A: survivability, fullMark: 100 },
            { subject: 'Takım Oyunu', A: teamwork, fullMark: 100 },
            { subject: 'Eşya Formu', A: farming, fullMark: 100 },
            { subject: 'İstikrar', A: stability, fullMark: 100 },
        ];
    }

    /**
     * Generate Pre-Match build and tactical recommendation based on allied hero, enemy threats, and real-time economy / win probability.
     */
    static generateBuildRecommendation(heroId: string, threats: string[], t: (key: string, options?: unknown) => string, matchMinute: number = 0, playerGold: number = 0, alliedHeroIds: string[] = [], language: string = 'tr', pastMatches: MatchRecord[] = []): DraftRecommendation {
        const hero = getHeroById(heroId);
        if (!hero) return { coreItems: [], situationalItems: [], buildPath: [], tacticalNote: t('hero_not_found') };

        let coreItems: string[] = [];
        let situationalItems: string[] = [];
        let recommendedEmblem: import('../types').RecommendedEmblemTree | undefined = undefined;
        let recommendedSpell: string | undefined;
        let note = "";

        // Recommended Emblem & Spell Logic (Oracle V3)
        if (hero.roles.includes('Assassin')) {
            recommendedEmblem = { id: 'assassin', tier1Id: 'rupture', tier2Id: 'master_assassin', coreId: 'killing_spree' };
            recommendedSpell = 'retribution';
            coreItems = ['magic_shoes', 'blade_of_despair'];
        } else if (hero.roles.includes('Mage')) {
            recommendedEmblem = { id: 'mage', tier1Id: 'inspire', tier2Id: 'bargain_hunter', coreId: 'impure_rage' };
            recommendedSpell = hero.roles.includes('Assassin') ? 'execute' : 'flicker';
            coreItems = ['magic_shoes', 'holy_crystal'];
        } else if (hero.roles.includes('Marksman')) {
            recommendedEmblem = { id: 'marksman', tier1Id: 'swift', tier2Id: 'weapons_master', coreId: 'weakness_finder' };
            recommendedSpell = 'inspire';
            coreItems = ['magic_shoes', 'blade_of_despair'];
        } else if (hero.roles.includes('Tank')) {
            recommendedEmblem = { id: 'tank', tier1Id: 'vitality', tier2Id: 'tenacity', coreId: 'concussive_blast' };
            recommendedSpell = 'vengeance';
            coreItems = ['magic_shoes', 'antique_cuirass'];
        } else if (hero.roles.includes('Support')) {
            recommendedEmblem = { id: 'support', tier1Id: 'agility', tier2Id: 'pull_yourself_together', coreId: 'focusing_mark' };
            recommendedSpell = 'revitalize';
            coreItems = ['magic_shoes', 'holy_crystal']; // fallback
        } else {
            // Fighter default
            recommendedEmblem = { id: 'fighter', tier1Id: 'firmness', tier2Id: 'festival_of_blood', coreId: 'brave_smite' };
            recommendedSpell = 'petrify';
            coreItems = ['magic_shoes', 'blade_of_despair'];
        }

        // Tehdide göre ana yetenek (core talent) ayarı
        if (recommendedEmblem) {
            if (threats.includes('Healer/Regen') && ['assassin', 'mage', 'fighter', 'marksman'].includes(recommendedEmblem.id)) {
                recommendedEmblem = { ...recommendedEmblem, coreId: 'lethal_ignition' };
            }
            if (threats.includes('Physical Assassin') && recommendedEmblem.id === 'assassin') {
                recommendedEmblem = { ...recommendedEmblem, coreId: 'killing_spree' };
            }
            if (threats.includes('High HP Tank') && recommendedEmblem.id === 'mage') {
                recommendedEmblem = { ...recommendedEmblem, coreId: 'impure_rage' };
            }
            if (threats.includes('Crowd Control') && ['fighter', 'marksman'].includes(recommendedEmblem.id)) {
                recommendedEmblem = { ...recommendedEmblem, coreId: 'war_cry' };
            }
        }

        // Oracle V5: Micro Mechanics Overrides
        if (hero.mobilityLevel === 'Low' && recommendedSpell !== 'retribution' && !hero.roles.includes('Tank') && !hero.roles.includes('Support')) {
            recommendedSpell = 'flicker';
        }

        // Determine situational and tactical note based on threats
        const isPhysicalHero = hero.roles.includes('Marksman') || hero.roles.includes('Assassin') || hero.roles.includes('Fighter');

        const threatNotes: string[] = [];

        if (threats.includes('Healer/Regen')) {
            situationalItems.push(isPhysicalHero ? 'sea_halberd' : 'dominance_ice');
            threatNotes.push(t('draft_note_healer'));
        }

        if (threats.includes('Burst Magic')) {
            situationalItems.push('athenas_shield');
            threatNotes.push(t('draft_note_burst'));
        }

        if (threats.includes('High HP Tank')) {
            situationalItems.push(isPhysicalHero ? 'demon_hunter_sword' : 'glowing_wand');
            threatNotes.push(t('draft_note_tank'));
        }

        if (threats.includes('Physical Assassin')) {
            situationalItems.push('antique_cuirass');
            threatNotes.push(t('draft_note_assassin'));
        }

        if (threatNotes.length === 0) {
            note = t('draft_note_safe', { heroName: hero.name });
        } else {
            note = threatNotes.join(" ");
        }

        // Geçmiş maç verilerinden amblem öğrenimi
        if (pastMatches.length >= 3 && recommendedEmblem) {
            const { bestCombo, heroEmblemNote } = this.analyzeEmblemPerformance(pastMatches, heroId);
            if (bestCombo) {
                // Tehdit varsa tehdit-bazlı core'u koru, yoksa geçmiş veriden al
                const coreId = (threats.length > 0 && recommendedEmblem.coreId)
                    ? recommendedEmblem.coreId
                    : (bestCombo.coreId || recommendedEmblem.coreId);
                recommendedEmblem = { id: bestCombo.id, tier1Id: bestCombo.tier1Id, tier2Id: bestCombo.tier2Id, coreId };
                if (heroEmblemNote) note += ' ' + heroEmblemNote;
            }
        }

        // Deduplicate
        coreItems = Array.from(new Set(coreItems));
        situationalItems = Array.from(new Set(situationalItems));

        const allRecommendedItems = [...coreItems, ...situationalItems];
        const buildStats = this.calculateBuildStats(allRecommendedItems);

        // V6: Build Path Generation
        const buildPath: { id: string; isSubItem: boolean }[] = [];
        buildPath.push({ id: 'boots_tier1', isSubItem: true });

        const addCoreItemWithSub = (itemId: string) => {
            if (itemId === 'blade_of_despair') buildPath.push({ id: 'legion_sword', isSubItem: true });
            else if (itemId === 'hunter_strike' || itemId === 'malefic_roar') buildPath.push({ id: 'fury_hammer', isSubItem: true });
            else if (itemId === 'bloodlust_axe' || itemId === 'war_axe' || itemId === 'haass_claws') buildPath.push({ id: 'vampire_mallet', isSubItem: true });
            else if (itemId === 'holy_crystal' || itemId === 'blood_wings' || itemId === 'genius_wand') buildPath.push({ id: 'magic_wand', isSubItem: true });
            else if (itemId === 'clock_of_destiny' || itemId === 'lightning_truncheon') buildPath.push({ id: 'elegant_gem', isSubItem: true });
            else if (itemId === 'dominance_ice' || itemId === 'antique_cuirass') buildPath.push({ id: 'black_ice_shield', isSubItem: true });
            else if (itemId === 'athenas_shield' || itemId === 'radiant_armor') buildPath.push({ id: 'silence_robe', isSubItem: true });
            else if (itemId === 'blade_armor') buildPath.push({ id: 'steel_legplates', isSubItem: true });
            else if (itemId === 'endless_battle' || itemId === 'bloodlust_axe' || itemId === 'war_axe') buildPath.push({ id: 'ogre_tomahawk', isSubItem: true });

            buildPath.push({ id: itemId, isSubItem: false });
        };

        coreItems.forEach(itemId => {
            if (itemId.includes('shoes') || itemId.includes('boots')) {
                buildPath.push({ id: itemId, isSubItem: false });
            } else {
                addCoreItemWithSub(itemId);
            }
        });

        // Add 1 situational conceptually to the build path to show progression
        if (situationalItems.length > 0) {
            addCoreItemWithSub(situationalItems[0]);
        }

        // V6: Macro Strategy Generation
        let macroStrategy = "";
        if (recommendedSpell === 'retribution') {
            if (hero.powerSpike === 'Early') {
                macroStrategy = t('macro_jungler_early');
            } else {
                macroStrategy = t('macro_jungler_late');
            }
        } else if (hero.roles.includes('Marksman')) {
            macroStrategy = t('macro_gold_lane');
        } else if (hero.roles.includes('Fighter')) {
            macroStrategy = t('macro_exp_lane');
        } else if (hero.roles.includes('Mage')) {
            macroStrategy = t('macro_mid_lane');
        } else if (hero.roles.includes('Support') || hero.roles.includes('Tank')) {
            macroStrategy = t('macro_roamer');
        } else {
            macroStrategy = t('macro_default');
        }

        // V6.5 Pro Mechanics Injection
        let proTip = "";
        if (hero.roles.includes('Assassin') || hero.roles.includes('Fighter')) {
            proTip = t('macro_tip_animation_cancel');
        } else if (hero.roles.includes('Marksman')) {
            proTip = t('macro_tip_basic_reset');
        } else if (hero.roles.includes('Mage') || hero.roles.includes('Support')) {
            proTip = t('macro_tip_wave_management');
        }

        if (proTip) {
            macroStrategy += "\n\n💡 " + proTip;
        }

        // V7: Economy Injection
        let economyTactic = undefined;
        if (matchMinute > 0) {
            const gapData = calculateFarmGap(playerGold, matchMinute, hero.roles[0]);
            economyTactic = language === 'tr' ? gapData.suggestedActionTR : gapData.suggestedActionEN;
        }

        // V8: Win Probability Injection
        let winProbability = undefined;
        if (alliedHeroIds.length > 0) {
            // Need to map threat names to IDs for accurate calc, or just pass threat names
            // Threats are currently just strings like 'Burst Magic', map them vaguely or modify winProb Engine 
            // Currently winProbability takes IDs. In PreMatchDrafter we select allies and enemies. 
            // We'll pass the exact enemy draft if provided on the component level, but for now just calculate allies + hero

            // To be accurate, we will include the target heroId inside the allies list automatically if not present
            const fullAllies = [...alliedHeroIds];
            if (!fullAllies.includes(heroId)) fullAllies.push(heroId);

            winProbability = calculateWinProbability(fullAllies, []);
            // To make parsing full enemy draft possible, we'd need another param `enemyHeroIds`. 
            // For MVP V8, assessing the allied synergy itself provides a strong baseline.
        }

        return { coreItems, situationalItems, recommendedEmblem, recommendedSpell, tacticalNote: note, buildStats, buildPath, macroStrategy, economyTactic, winProbability };
    }

    /**
     * Calculate aggregated stats for a given array of item IDs.
     */
    static calculateBuildStats(itemIds: string[]): Record<string, number> {
        const totalStats: Record<string, number> = {
            physicalAttack: 0,
            magicPower: 0,
            hp: 0,
            mana: 0,
            physicalDefense: 0,
            magicDefense: 0,
            movementSpeed: 0,
            attackSpeed: 0,
            critChance: 0,
            cdr: 0,
            lifesteal: 0,
            spellVamp: 0,
            manaRegen: 0,
            hpRegen: 0,
            magicPenetration: 0,
            physicalPenetration: 0
        };

        itemIds.forEach(id => {
            const item = getItemById(id);
            if (item && item.stats) {
                // Add all available numeric stats from the item
                Object.keys(totalStats).forEach((key) => {
                    const statKey = key as keyof typeof totalStats;
                    const itemStats = item.stats as Record<string, number>; // Bypass TS index signature error
                    if (itemStats && itemStats[statKey] !== undefined) {
                        totalStats[statKey] += itemStats[statKey] as number;
                    }
                });
            }
        });

        // Filter out zero stats
        const filteredStats: Record<string, number> = {};
        Object.entries(totalStats).forEach(([key, value]) => {
            if (value > 0) {
                filteredStats[key] = value;
            }
        });

        return filteredStats;
    }

    /**
     * V4 Matchup Analysis
     * Determines if the selected hero counters or is countered by any of the enemy heroes.
     */
    static analyzeMatchup(selectedHeroId: string, enemyHeroIds: string[]): { isCounteredBy: string[], counters: string[] } {
        const hero = getHeroById(selectedHeroId);
        if (!hero) return { isCounteredBy: [], counters: [] };

        const isCounteredBy: string[] = [];
        const counters: string[] = [];

        enemyHeroIds.forEach(enemyId => {
            if (hero.weakAgainst?.includes(enemyId)) {
                isCounteredBy.push(enemyId);
            }
            if (hero.strongAgainst?.includes(enemyId)) {
                counters.push(enemyId);
            }
        });

        return { isCounteredBy, counters };
    }

    /**
     * Geçmiş maçlardan amblem performansını analiz eder ve en iyi kombinasyonu döner.
     * En az 3 maç gerektirir; kahraman bazında veya genel hesaplayabilir.
     */
    static analyzeEmblemPerformance(matches: MatchRecord[], heroId?: string): {
        bestCombo: import('../types').RecommendedEmblemTree | null;
        heroEmblemNote: string;
    } {
        const filtered = matches.filter(m => {
            const hid = m.hero_id || m.heroId;
            return m.emblem_id && (!heroId || hid === heroId);
        });

        if (filtered.length < 3) return { bestCombo: null, heroEmblemNote: '' };

        // Combo key: emblemId__tier1__tier2__core
        const comboStats: Record<string, {
            wins: number; total: number;
            emblemId: string; tier1Id: string; tier2Id: string; coreId: string;
        }> = {};

        filtered.forEach(m => {
            const key = `${m.emblem_id}__${m.emblem_tier1_id ?? ''}__${m.emblem_tier2_id ?? ''}__${m.emblem_core_id ?? ''}`;
            if (!comboStats[key]) {
                comboStats[key] = {
                    wins: 0, total: 0,
                    emblemId: m.emblem_id!,
                    tier1Id: m.emblem_tier1_id ?? '',
                    tier2Id: m.emblem_tier2_id ?? '',
                    coreId: m.emblem_core_id ?? '',
                };
            }
            comboStats[key].total++;
            if (m.result === 'Victory') comboStats[key].wins++;
        });

        let bestCombo: import('../types').RecommendedEmblemTree | null = null;
        let bestWinRate = -1;
        let bestTotal = 0;

        Object.values(comboStats).forEach(stat => {
            if (stat.total < 2) return;
            const wr = stat.wins / stat.total;
            if (wr > bestWinRate || (wr === bestWinRate && stat.total > bestTotal)) {
                bestWinRate = wr;
                bestTotal = stat.total;
                bestCombo = { id: stat.emblemId, tier1Id: stat.tier1Id, tier2Id: stat.tier2Id, coreId: stat.coreId };
            }
        });

        let heroEmblemNote = '';
        if (bestCombo && bestTotal >= 3) {
            const wr = Math.round(bestWinRate * 100);
            heroEmblemNote = `📊 Geçmiş ${bestTotal} maça göre bu kahramanda en yüksek kazanma (%${wr}) sağlayan amblem kombinasyonu önerildi.`;
        }

        return { bestCombo, heroEmblemNote };
    }

    /**
     * Tilt/Streak Detection — son maç geçmişine göre oyuncu durumu tespiti.
     * Kayıp serisi, kazanma serisi veya ölüm paterni tespit eder.
     */
    static detectTiltPattern(matches: MatchRecord[]): {
        alert: string | null;
        type: 'tilt' | 'streak' | null;
        count: number;
    } {
        if (matches.length < 3) return { alert: null, type: null, count: 0 };

        // Consecutive losses (matches are newest-first)
        let consecutiveLosses = 0;
        for (const m of matches) {
            if (m.result === 'Defeat') consecutiveLosses++;
            else break;
        }

        let consecutiveWins = 0;
        for (const m of matches) {
            if (m.result === 'Victory') consecutiveWins++;
            else break;
        }

        const recent3 = matches.slice(0, 3);
        const avgDeaths3 = recent3.reduce((acc, m) => acc + m.deaths, 0) / recent3.length;

        const recent5 = matches.slice(0, Math.min(5, matches.length));
        const losses5 = recent5.filter(m => m.result === 'Defeat').length;

        if (consecutiveLosses >= 5) {
            return {
                alert: `🚨 KRİTİK TİLT: Son ${consecutiveLosses} maçı üst üste kaybettin. Bir mola vermeyi düşün — zorlanmış zihin kötü kararlar almanı sağlar.`,
                type: 'tilt',
                count: consecutiveLosses
            };
        }

        if (consecutiveLosses >= 3) {
            return {
                alert: `⚠️ KAYBETME SERİSİ: Son ${consecutiveLosses} maçı üst üste kaybettin. Kahraman değiştirmeyi veya kısa bir mola vermeyi dene.`,
                type: 'tilt',
                count: consecutiveLosses
            };
        }

        if (consecutiveWins >= 4) {
            return {
                alert: `🔥 SICAK SERİ: Son ${consecutiveWins} maçı üst üste kazandın! Bu ritmi koru ve agresif draft seç.`,
                type: 'streak',
                count: consecutiveWins
            };
        }

        if (avgDeaths3 >= 8) {
            return {
                alert: `⚠️ POZİSYON UYARISI: Son 3 maçta ortalama ${avgDeaths3.toFixed(1)} ölüm var. Harita farkındalığını artır ve düşman rotasyonlarını takip et.`,
                type: 'tilt',
                count: 3
            };
        }

        if (losses5 >= 4) {
            return {
                alert: `⚠️ TİLT TEHLİKESİ: Son ${recent5.length} maçın ${losses5}'ini kaybettin. Farklı bir kahraman veya rol dene.`,
                type: 'tilt',
                count: losses5
            };
        }

        return { alert: null, type: null, count: 0 };
    }

    /**
     * Hero öneri motoru — düşman komp, takım eksikleri ve geçmiş maç verisi
     * kullanarak en uygun kahramanları skorlar ve sıralı liste döner.
     */
    static recommendHeroForDraft(
        enemyHeroIds: string[],
        alliedHeroIds: string[],
        pastMatches: MatchRecord[],
        limit: number = 6
    ): Array<{ hero: ReturnType<typeof getHeroById> extends null ? never : NonNullable<ReturnType<typeof getHeroById>>; score: number; reason: string }> {
        const allHeroes = getAllHeroes();
        const takenIds = new Set([...enemyHeroIds, ...alliedHeroIds]);

        // Geçmiş maçlardan hero bazında kazanma oranları
        const heroWinRates: Record<string, { wins: number; total: number }> = {};
        pastMatches.forEach(m => {
            const hid = m.hero_id || m.heroId;
            if (!hid) return;
            if (!heroWinRates[hid]) heroWinRates[hid] = { wins: 0, total: 0 };
            heroWinRates[hid].total++;
            if (m.result === 'Victory') heroWinRates[hid].wins++;
        });

        // Takım eksikleri
        const allies = alliedHeroIds.map(id => getHeroById(id)).filter(Boolean) as NonNullable<ReturnType<typeof getHeroById>>[];
        const hasMarksman = allies.some(h => h.roles.includes('Marksman'));
        const hasTank = allies.some(h => h.roles.includes('Tank'));
        const hasSupport = allies.some(h => h.roles.includes('Support'));
        const hasMagic = allies.some(h => h.damageType === 'Magic' || h.damageType === 'Mixed');

        type ScoredHero = { hero: NonNullable<ReturnType<typeof getHeroById>>; score: number; reason: string };

        const results: ScoredHero[] = allHeroes
            .filter(h => !takenIds.has(h.id))
            .map(hero => {
                let score = 50;
                const reasons: string[] = [];

                // Meta tier bonusu
                if ((hero as any).metaTier === 'S') { score += 20; reasons.push('S-Tier meta'); }
                else if ((hero as any).metaTier === 'A') { score += 10; reasons.push('A-Tier'); }
                else if ((hero as any).metaTier === 'C') score -= 10;
                else if ((hero as any).metaTier === 'D') score -= 20;

                // Counter avantajı
                let counterScore = 0;
                enemyHeroIds.forEach(eid => {
                    if (hero.strongAgainst?.includes(eid)) counterScore += 15;
                    if (hero.weakAgainst?.includes(eid)) counterScore -= 12;
                });
                if (counterScore > 0) reasons.push(`+${counterScore} counter`);
                score += counterScore;

                // Sinerji bonusu
                let synergyScore = 0;
                alliedHeroIds.forEach(aid => {
                    if (hero.synergies?.includes(aid)) synergyScore += 10;
                });
                if (synergyScore > 0) { score += synergyScore; reasons.push(`+${synergyScore} sinerji`); }

                // Takım eksiği bonusu
                if (!hasMarksman && hero.roles.includes('Marksman')) { score += 15; reasons.push('ADC eksik'); }
                if (!hasTank && hero.roles.includes('Tank')) { score += 12; reasons.push('Tank eksik'); }
                if (!hasSupport && hero.roles.includes('Support')) { score += 12; reasons.push('Destek eksik'); }
                if (!hasMagic && (hero.damageType === 'Magic' || hero.damageType === 'Mixed')) { score += 10; reasons.push('Büyü hasarı eksik'); }

                // Geçmiş WR bonusu (min 3 maç)
                const wr = heroWinRates[hero.id];
                if (wr && wr.total >= 3) {
                    const pct = Math.round((wr.wins / wr.total) * 100);
                    if (pct >= 60) { score += 15; reasons.push(`%${pct} WR geçmişten`); }
                    else if (pct <= 35) score -= 10;
                }

                const reason = reasons.slice(0, 2).join(' · ') || 'Dengeli seçim';
                return { hero, score, reason };
            })
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);

        return results;
    }

    /**
     * V5 Team Composition Analysis
     */
    static analyzeTeamComp(alliedHeroIds: string[], t: (key: string, options?: unknown) => string): {
        warnings: string[];
        synergies: string[];
        powerScores: { early: number, mid: number, late: number };
        ccScore: number;
    } {
        const warnings: string[] = [];
        const synergies: string[] = [];
        const powerScores = { early: 0, mid: 0, late: 0 };
        let ccScore = 0;

        if (alliedHeroIds.length === 0) {
            return { warnings, synergies, powerScores, ccScore };
        }

        const allies = alliedHeroIds.map(id => getHeroById(id)).filter(Boolean) as any[];

        allies.forEach(hero => {
            if (hero.powerSpike === 'Early') powerScores.early += 1;
            else if (hero.powerSpike === 'Mid') powerScores.mid += 1;
            else if (hero.powerSpike === 'Late') powerScores.late += 1;

            if (hero.ccLevel === 'High') ccScore += 2;
            else if (hero.ccLevel === 'Medium') ccScore += 1;
        });

        if (allies.length >= 3) {
            if (powerScores.late >= 3 && powerScores.early === 0) {
                warnings.push(t('comp_warn_too_late'));
            } else if (powerScores.early >= 3 && powerScores.late === 0) {
                warnings.push(t('comp_warn_too_early'));
            }

            if (ccScore < 2) {
                warnings.push(t('comp_warn_low_cc'));
            }
        }

        const roles = allies.flatMap(h => h.roles);
        const hasTankOrSupport = roles.includes('Tank') || roles.includes('Support');
        if (allies.length >= 4 && !hasTankOrSupport) {
            warnings.push(t('comp_warn_no_frontline'));
        }

        const hasMagicDamage = allies.some(h => h.damageType === 'Magic' || h.damageType === 'Mixed');

        if (allies.length >= 4 && !hasMagicDamage) {
            warnings.push(t('comp_warn_all_physical'));
        }

        // Calculate synergies within the team
        for (let i = 0; i < allies.length; i++) {
            for (let j = i + 1; j < allies.length; j++) {
                if (allies[i].synergies?.includes(allies[j].id) || allies[j].synergies?.includes(allies[i].id)) {
                    synergies.push(`${allies[i].name} & ${allies[j].name}`);
                }
            }
        }

        const uniqueSynergies = Array.from(new Set(synergies));

        return { warnings, synergies: uniqueSynergies, powerScores, ccScore };
    }
}
