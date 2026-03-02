import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getAllHeroes } from '../data/heroes';
import { getItemById } from '../data/items';
import { getEmblemById } from '../data/emblems';
import { getSpellById } from '../data/spells';
import { MLAnalyzer } from '../services/MLAnalyzer';
import { supabase } from '../lib/supabase';
import type { DraftRecommendation, MatchRecord } from '../types';
import { Shield, Crosshair, Target, BrainCircuit, Skull, Activity, ShieldAlert, Zap, AlertTriangle, Swords, X, Users, Lightbulb, ArrowRight, Map, LineChart, Star } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';

const THREATS = [
    { id: 'Healer/Regen', labelKey: 'draft_threat_healer', icon: Activity, color: 'text-emerald-400', accent: 'border-emerald-500/50 bg-emerald-500/10' },
    { id: 'Burst Magic', labelKey: 'draft_threat_burst', icon: Zap, color: 'text-mlbb-purple', accent: 'border-mlbb-purple/50 bg-mlbb-purple/10' },
    { id: 'High HP Tank', labelKey: 'draft_threat_tank', icon: Shield, color: 'text-mlbb-gold', accent: 'border-mlbb-gold/50 bg-mlbb-gold/10' },
    { id: 'Physical Assassin', labelKey: 'draft_threat_assassin', icon: Skull, color: 'text-mlbb-danger', accent: 'border-mlbb-danger/50 bg-mlbb-danger/10' },
    { id: 'Crowd Control', labelKey: 'draft_threat_cc', icon: Target, color: 'text-mlbb-neonBlue', accent: 'border-mlbb-neonBlue/50 bg-mlbb-neonBlue/10' }
];

type DrafterMode = 'build' | 'hero-recommend';

export const PreMatchDrafter: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [mode, setMode] = useState<DrafterMode>('build');
    const [selectedHeroId, setSelectedHeroId] = useState<string>('');
    const [selectedThreats, setSelectedThreats] = useState<string[]>([]);
    const [enemyHeroIds, setEnemyHeroIds] = useState<string[]>([]);
    const [alliedHeroIds, setAlliedHeroIds] = useState<string[]>([]);
    const [pastMatches, setPastMatches] = useState<MatchRecord[]>([]);

    const heroes = getAllHeroes();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session?.user) return;
            supabase
                .from('matches')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false })
                .limit(100)
                .then(({ data }) => { if (data) setPastMatches(data as MatchRecord[]); });
        });
    }, []);

    const recommendation: DraftRecommendation | null = selectedHeroId
        ? MLAnalyzer.generateBuildRecommendation(selectedHeroId, selectedThreats, t as any, 0, 0, alliedHeroIds, i18n.language, pastMatches)
        : null;

    const toggleThreat = (threatId: string) => {
        setSelectedThreats(prev =>
            prev.includes(threatId) ? prev.filter(t => t !== threatId) : [...prev, threatId]
        );
    };

    const toggleEnemyHero = (heroId: string) => {
        setEnemyHeroIds(prev => {
            if (prev.includes(heroId)) return prev.filter(id => id !== heroId);
            if (prev.length >= 5) return prev;
            return [...prev, heroId];
        });
    };

    const toggleAlliedHero = (heroId: string) => {
        setAlliedHeroIds(prev => {
            if (prev.includes(heroId)) return prev.filter(id => id !== heroId);
            if (prev.length >= 4) return prev;
            return [...prev, heroId];
        });
    };

    const matchupStats = selectedHeroId && enemyHeroIds.length > 0
        ? MLAnalyzer.analyzeMatchup(selectedHeroId, enemyHeroIds)
        : null;

    const teamCompStats = (selectedHeroId || alliedHeroIds.length > 0)
        ? MLAnalyzer.analyzeTeamComp([selectedHeroId, ...alliedHeroIds].filter(Boolean), t as any)
        : null;

    const winScore = recommendation?.winProbability?.score ?? 50;
    const winColor = winScore >= 55 ? 'text-mlbb-success border-mlbb-success/40 bg-mlbb-success/10' : winScore <= 45 ? 'text-mlbb-danger border-mlbb-danger/40 bg-mlbb-danger/10' : 'text-mlbb-gold border-mlbb-gold/40 bg-mlbb-gold/10';

    // Hero recommendation mode
    const heroRecommendations = mode === 'hero-recommend'
        ? MLAnalyzer.recommendHeroForDraft(enemyHeroIds, alliedHeroIds, pastMatches, 6)
        : [];

    return (
        <div className="w-full max-w-5xl mx-auto space-y-8 pb-12">

            {/* Page Header */}
            <div className="text-center">
                <p className="section-label mb-3">AI-POWERED STRATEGY</p>
                <h1 className="font-display font-black text-4xl md:text-5xl gradient-text-cyber tracking-wider uppercase mb-3">
                    {t('draft_title')}
                </h1>
                <p className="text-gray-500 text-sm font-mono max-w-lg mx-auto">{t('draft_desc')}</p>

            {/* Mode Tabs */}
            <div className="flex justify-center mt-5">
                <div className="flex gap-1 bg-black/50 p-1 rounded-xl border border-white/[0.06]">
                    <button
                        onClick={() => setMode('build')}
                        className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold font-mono uppercase tracking-wider transition-all ${mode === 'build' ? 'bg-mlbb-neonBlue/20 text-mlbb-neonBlue' : 'text-gray-600 hover:text-gray-300'}`}
                    >
                        <BrainCircuit className="w-3.5 h-3.5" /> Build Öner
                    </button>
                    <button
                        onClick={() => setMode('hero-recommend')}
                        className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold font-mono uppercase tracking-wider transition-all ${mode === 'hero-recommend' ? 'bg-mlbb-gold/20 text-mlbb-gold' : 'text-gray-600 hover:text-gray-300'}`}
                    >
                        <Star className="w-3.5 h-3.5" /> Kahraman Öner
                    </button>
                </div>
            </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* ── LEFT COLUMN: Draft Setup ── */}
                <div className="space-y-5">

                    {/* Hero + Team Selection */}
                    <div className="aurora-border rounded-2xl">
                        <div className="card-glass rounded-2xl p-6 space-y-6 relative overflow-hidden">
                            {/* Top glow line */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-mlbb-neonBlue/50 to-transparent" />

                            {/* My Hero */}
                            <div>
                                <label className="section-label flex items-center gap-2 mb-3">
                                    <Crosshair className="w-3.5 h-3.5 text-mlbb-gold" />
                                    {t('draft_select_hero')}
                                </label>
                                <select
                                    value={selectedHeroId}
                                    onChange={(e) => setSelectedHeroId(e.target.value)}
                                    className="input-cyber w-full"
                                >
                                    <option value="">{t('draft_placeholder_hero')}</option>
                                    {heroes.map(h => (
                                        <option key={h.id} value={h.id}>{h.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Allied Heroes */}
                            <div>
                                <label className="section-label flex items-center gap-2 mb-3">
                                    <Users className="w-3.5 h-3.5 text-mlbb-neonBlue" />
                                    TAKIM ARKADAŞLARI
                                    <span className="ml-auto font-mono text-mlbb-neonBlue/70">{alliedHeroIds.length}/4</span>
                                </label>
                                <select
                                    value=""
                                    onChange={(e) => { if (e.target.value) toggleAlliedHero(e.target.value); }}
                                    className="input-cyber w-full"
                                    style={{ borderColor: 'rgba(0,240,255,0.2)' }}
                                    disabled={alliedHeroIds.length >= 4}
                                >
                                    <option value="">— TAKIM ARKADAŞI EKLE —</option>
                                    {heroes.map(h => (
                                        <option key={h.id} value={h.id} disabled={alliedHeroIds.includes(h.id) || selectedHeroId === h.id || enemyHeroIds.includes(h.id)}>{h.name}</option>
                                    ))}
                                </select>
                                {alliedHeroIds.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {alliedHeroIds.map(id => {
                                            const h = heroes.find(hero => hero.id === id);
                                            if (!h) return null;
                                            return (
                                                <div key={id} onClick={() => toggleAlliedHero(id)}
                                                    className="group relative w-11 h-11 rounded-xl overflow-hidden border border-mlbb-neonBlue/40 cursor-pointer hover:border-mlbb-neonBlue transition-colors">
                                                    <ImageWithFallback src={h.imagePath} alt={h.name} className="w-full h-full object-cover group-hover:opacity-40 transition-opacity" fallbackText="A" />
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <X className="w-4 h-4 text-white" />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Enemy Heroes */}
                            <div>
                                <label className="section-label flex items-center gap-2 mb-3">
                                    <Swords className="w-3.5 h-3.5 text-mlbb-danger" />
                                    RAKİP KAHRAMANLAR
                                    <span className="ml-auto font-mono text-mlbb-danger/70">{enemyHeroIds.length}/5</span>
                                </label>
                                <select
                                    value=""
                                    onChange={(e) => { if (e.target.value) toggleEnemyHero(e.target.value); }}
                                    className="input-cyber w-full"
                                    style={{ borderColor: 'rgba(255,50,80,0.2)' }}
                                    disabled={enemyHeroIds.length >= 5}
                                >
                                    <option value="">— RAKİP EKLE —</option>
                                    {heroes.map(h => (
                                        <option key={h.id} value={h.id} disabled={enemyHeroIds.includes(h.id) || selectedHeroId === h.id || alliedHeroIds.includes(h.id)}>{h.name}</option>
                                    ))}
                                </select>
                                {enemyHeroIds.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {enemyHeroIds.map(id => {
                                            const h = heroes.find(hero => hero.id === id);
                                            if (!h) return null;
                                            return (
                                                <div key={id} onClick={() => toggleEnemyHero(id)}
                                                    className="group relative w-11 h-11 rounded-xl overflow-hidden border border-mlbb-danger/40 cursor-pointer hover:border-mlbb-danger transition-colors">
                                                    <ImageWithFallback src={h.imagePath} alt={h.name} className="w-full h-full object-cover group-hover:opacity-40 transition-opacity" fallbackText="E" />
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <X className="w-4 h-4 text-white" />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Threat Selection */}
                    <div className={`card-glass rounded-2xl p-6 relative overflow-hidden transition-opacity ${selectedHeroId ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-mlbb-danger/40 to-transparent" />
                        <label className="section-label flex items-center gap-2 mb-4">
                            <ShieldAlert className="w-3.5 h-3.5 text-mlbb-danger" />
                            {t('draft_enemy_threats')}
                        </label>
                        <div className="space-y-2">
                            {THREATS.map(threat => {
                                const Icon = threat.icon;
                                const isActive = selectedThreats.includes(threat.id);
                                return (
                                    <button
                                        key={threat.id}
                                        type="button"
                                        onClick={() => toggleThreat(threat.id)}
                                        className={`flex items-center justify-between w-full px-4 py-3 rounded-xl border transition-all duration-200 ${isActive ? threat.accent : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon className={`w-4 h-4 ${isActive ? threat.color : 'text-gray-600'}`} />
                                            <span className={`text-xs font-mono tracking-widest uppercase ${isActive ? 'text-white' : 'text-gray-500'}`}>
                                                {t(threat.labelKey)}
                                            </span>
                                        </div>
                                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${isActive ? `${threat.color} border-current` : 'border-gray-700'}`}>
                                            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ── RIGHT COLUMN: Oracle Panel / Hero Recommend ── */}
                <div>
                    {/* ── HERO RECOMMENDATION MODE ── */}
                    {mode === 'hero-recommend' ? (
                        <div className="card-glass rounded-2xl p-6 space-y-4 relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-mlbb-gold/50 to-transparent" />
                            <div className="flex items-center gap-3">
                                <Star className="w-4 h-4 text-mlbb-gold" />
                                <h2 className="font-display font-bold text-sm tracking-widest uppercase text-white">Kahraman Öner</h2>
                                <span className="ml-auto text-[10px] font-mono text-gray-600 uppercase tracking-widest">
                                    {enemyHeroIds.length > 0 ? `${enemyHeroIds.length} rakip analiz edildi` : 'Rakip seçin'}
                                </span>
                            </div>

                            {heroRecommendations.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <Star className="w-12 h-12 text-gray-800 mb-4" />
                                    <p className="text-gray-600 font-mono text-sm uppercase tracking-widest">Rakip kahraman seçerek</p>
                                    <p className="text-gray-700 font-mono text-xs mt-1">en iyi öneriyi al</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {heroRecommendations.map(({ hero, score, reason }, idx) => (
                                        <div key={hero.id} className={`flex items-center gap-3 rounded-xl p-3 border transition-colors ${idx === 0 ? 'border-mlbb-gold/40 bg-mlbb-gold/[0.06]' : 'border-white/[0.06] bg-white/[0.02] hover:border-white/10'}`}>
                                            {/* Rank */}
                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono shrink-0 ${idx === 0 ? 'bg-mlbb-gold text-black' : 'bg-white/10 text-gray-400'}`}>
                                                {idx + 1}
                                            </div>
                                            {/* Hero image */}
                                            <div className={`w-11 h-11 rounded-xl overflow-hidden border shrink-0 ${idx === 0 ? 'border-mlbb-gold/50' : 'border-white/10'}`}>
                                                <ImageWithFallback src={hero.imagePath} alt={hero.name} className="w-full h-full object-cover" fallbackText={hero.name.substring(0, 2)} />
                                            </div>
                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className={`font-display font-bold text-sm truncate ${idx === 0 ? 'text-mlbb-gold' : 'text-white'}`}>{hero.name}</p>
                                                    <div className="flex gap-1">
                                                        {hero.roles.slice(0, 2).map(r => (
                                                            <span key={r} className="text-[8px] font-mono text-gray-600 border border-gray-800 rounded px-1">{r}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-[10px] font-mono text-gray-600 mt-0.5 truncate">{reason}</p>
                                            </div>
                                            {/* Score */}
                                            <div className={`text-right shrink-0 ${idx === 0 ? 'text-mlbb-gold' : 'text-gray-500'}`}>
                                                <div className="text-base font-bold font-mono">{score}</div>
                                                <div className="text-[9px] uppercase tracking-widest">puan</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Quick tip */}
                            <div className="rounded-lg border border-mlbb-gold/10 bg-mlbb-gold/5 p-3 flex items-start gap-2">
                                <Lightbulb className="w-4 h-4 text-mlbb-gold shrink-0 mt-0.5" />
                                <p className="text-[11px] font-mono text-gray-500 leading-relaxed">
                                    Skor = meta tier + counter avantajı + takım eksiği + geçmiş maç WR birleşiminden hesaplanır.
                                    {pastMatches.length < 3 && ' Kişisel WR bonusu için en az 3 maç kaydet.'}
                                </p>
                            </div>
                        </div>
                    ) : recommendation ? (
                        <div className="aurora-border aurora-border-active rounded-2xl h-full">
                            <div className="card-glass rounded-2xl p-6 flex flex-col gap-5 relative overflow-hidden h-full">
                                {/* Ambient glow */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-mlbb-neonBlue/[0.04] rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

                                {/* Panel Header */}
                                <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="w-2 h-2 rounded-full bg-mlbb-neonBlue animate-pulse" />
                                            <div className="absolute inset-0 w-2 h-2 rounded-full bg-mlbb-neonBlue blur-sm" />
                                        </div>
                                        <span className="font-display font-bold text-white text-lg tracking-wider uppercase">{t('draft_oracle_panel')}</span>
                                    </div>
                                    {recommendation.winProbability && (
                                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-bold font-mono ${winColor}`}>
                                            <LineChart className="w-4 h-4" />
                                            %{winScore}
                                        </div>
                                    )}
                                </div>

                                {/* Oracle Verdict */}
                                {recommendation.winProbability && (
                                    <div className="rounded-xl border border-mlbb-purple/30 bg-mlbb-purple/10 p-4">
                                        <p className="text-xs font-mono text-mlbb-purpleLight flex items-center gap-2 mb-1.5">
                                            <BrainCircuit className="w-3.5 h-3.5" /> ORACLE V8 KEHANETİ
                                        </p>
                                        <p className="text-gray-300 text-sm leading-relaxed">{t(recommendation.winProbability.reasonTag)}</p>
                                    </div>
                                )}

                                {/* Matchup Alerts */}
                                {matchupStats?.isCounteredBy && matchupStats.isCounteredBy.length > 0 && (
                                    <div className="rounded-xl border border-mlbb-danger/40 bg-mlbb-danger/10 p-4 flex items-start gap-3">
                                        <AlertTriangle className="w-5 h-5 text-mlbb-danger shrink-0 mt-0.5 animate-pulse" />
                                        <div>
                                            <p className="text-mlbb-danger font-bold text-xs uppercase tracking-widest mb-1">COUNTER ALARMI</p>
                                            <p className="text-gray-300 text-sm">
                                                <span className="text-white font-semibold">{matchupStats.isCounteredBy.map(id => heroes.find(h => h.id === id)?.name).join(', ')}</span>
                                                {' '}kahramanına karşı çok zayıfsın. Agresif takaslardan kaçın.
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {matchupStats?.counters && matchupStats.counters.length > 0 && (
                                    <div className="rounded-xl border border-mlbb-success/30 bg-mlbb-success/10 p-4 flex items-start gap-3">
                                        <Activity className="w-5 h-5 text-mlbb-success shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-mlbb-success font-bold text-xs uppercase tracking-widest mb-1">AVANTAJLI EŞLEŞME</p>
                                            <p className="text-gray-300 text-sm">
                                                <span className="text-white font-semibold">{matchupStats.counters.map(id => heroes.find(h => h.id === id)?.name).join(', ')}</span>
                                                {' '}kahramanını eziyor! Baskılı oyna ve koridoru domine et.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Spell + Emblem Row */}
                                <div className="grid grid-cols-2 gap-3">
                                    {recommendation.recommendedSpell && (() => {
                                        const spell = getSpellById(recommendation.recommendedSpell);
                                        if (!spell) return null;
                                        return (
                                            <div className="rounded-xl border border-mlbb-neonBlue/20 bg-mlbb-neonBlue/5 p-3 flex items-center gap-3 hover:border-mlbb-neonBlue/40 transition-colors">
                                                <div className="w-12 h-12 rounded-lg border border-mlbb-neonBlue/40 overflow-hidden flex-shrink-0 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                                                    <ImageWithFallback src={spell.iconUrl} alt={spell.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] text-mlbb-neonBlue font-mono uppercase tracking-widest mb-0.5 flex items-center gap-1">
                                                        <Zap className="w-2.5 h-2.5" /> BÜYÜ
                                                    </p>
                                                    <p className="text-white text-sm font-semibold truncate">{spell.name}</p>
                                                    <p className="text-gray-500 text-[10px] line-clamp-1 italic">{spell.description}</p>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {recommendation.recommendedEmblem && (() => {
                                        const emblem = getEmblemById(recommendation.recommendedEmblem.id);
                                        if (!emblem) return null;
                                        const tier1 = emblem.tier1Talents?.find(t => t.id === recommendation.recommendedEmblem!.tier1Id);
                                        const tier2 = emblem.tier2Talents?.find(t => t.id === recommendation.recommendedEmblem!.tier2Id);
                                        const core = emblem.coreTalents?.find(t => t.id === recommendation.recommendedEmblem!.coreId);
                                        return (
                                            <div className="rounded-xl border border-mlbb-gold/20 bg-mlbb-gold/5 p-3 flex items-center gap-3 hover:border-mlbb-gold/40 transition-colors">
                                                <div className="flex flex-col items-center gap-1 shrink-0">
                                                    <div className="w-10 h-10 rounded-full border border-mlbb-gold/40 overflow-hidden">
                                                        <ImageWithFallback src={emblem.iconUrl} alt={emblem.name} className="w-full h-full object-cover rounded-full" />
                                                    </div>
                                                    <div className="flex gap-0.5">
                                                        {[tier1, tier2].map((tier, i) => tier && (
                                                            <div key={i} className="w-4 h-4 rounded border border-gray-700 bg-gray-900 overflow-hidden">
                                                                {tier.iconUrl && <ImageWithFallback src={tier.iconUrl} alt={tier.name} className="w-full h-full" />}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] text-mlbb-gold font-mono uppercase tracking-widest mb-0.5 flex items-center gap-1">
                                                        <BrainCircuit className="w-2.5 h-2.5" /> AMBLEM
                                                    </p>
                                                    <p className="text-white text-sm font-semibold truncate">{emblem.name}</p>
                                                    <p className="text-mlbb-gold text-[10px] truncate">Core: {core?.name}</p>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>

                                {/* Build Path */}
                                <div>
                                    <p className="section-label mb-3">ALIM SIRASI — BUILD PATH</p>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {(recommendation.buildPath ?? recommendation.coreItems.map(id => ({ id, isSubItem: false }))).map((step, idx) => {
                                            const itemId = typeof step === 'string' ? step : step.id;
                                            const isSubItem = typeof step === 'string' ? false : step.isSubItem;
                                            const item = getItemById(itemId);
                                            if (!item) return null;
                                            const isLast = idx === (recommendation.buildPath ?? recommendation.coreItems).length - 1;
                                            return (
                                                <React.Fragment key={`${itemId}-${idx}`}>
                                                    <div className="flex flex-col items-center group relative">
                                                        <div className={`w-12 h-12 rounded-xl border-2 overflow-hidden transition-transform group-hover:scale-110 cursor-help ${isSubItem ? 'border-mlbb-neonBlue/50 shadow-[0_0_8px_rgba(0,240,255,0.15)]' : 'border-mlbb-gold/50 shadow-[0_0_8px_rgba(255,191,0,0.15)]'}`}>
                                                            <ImageWithFallback src={item.iconUrl} alt={item.name} title={item.name} fallbackText={item.name.substring(0, 2)} />
                                                        </div>
                                                        <span className="text-[9px] text-gray-500 mt-1 text-center max-w-[3rem] leading-tight">{item.name}</span>
                                                        {isSubItem && (
                                                            <span className="absolute -top-1.5 -right-1.5 bg-mlbb-neonBlue text-black text-[8px] px-1 rounded font-bold">Alt</span>
                                                        )}
                                                    </div>
                                                    {!isLast && <ArrowRight className="w-3 h-3 text-gray-700 self-start mt-4 shrink-0" />}
                                                </React.Fragment>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Situational Items */}
                                {recommendation.situationalItems.length > 0 && (
                                    <div>
                                        <p className="section-label mb-3">{t('draft_situational_items')}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {recommendation.situationalItems.map(itemId => {
                                                const item = getItemById(itemId);
                                                return item ? (
                                                    <div key={itemId} className="flex flex-col items-center group w-12">
                                                        <div className="w-12 h-12 rounded-xl border-2 border-mlbb-danger/40 overflow-hidden group-hover:scale-110 transition-transform cursor-help shadow-[0_0_8px_rgba(255,50,80,0.1)]">
                                                            <ImageWithFallback src={item.iconUrl} alt={item.name} title={item.name} fallbackText={item.name.substring(0, 2)} />
                                                        </div>
                                                        <span className="text-[9px] text-gray-500 mt-1 text-center leading-tight">{item.name}</span>
                                                    </div>
                                                ) : null;
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Build Stats */}
                                {recommendation.buildStats && Object.keys(recommendation.buildStats).length > 0 && (
                                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                                        <p className="section-label flex items-center gap-2 mb-3">
                                            <Activity className="w-3 h-3" /> BUILD İSTATİSTİKLERİ
                                        </p>
                                        <div className="grid grid-cols-3 gap-2">
                                            {Object.entries(recommendation.buildStats).map(([stat, val]) => {
                                                if (val === 0) return null;
                                                const formatStatName = (s: string) => s.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                                const formatVal = (s: string, v: number) => (['attackSpeed', 'critChance', 'cdr', 'lifesteal', 'spellVamp', 'magicPenetration', 'physicalPenetration'].includes(s) && v <= 100) ? `+${v}%` : `+${v}`;
                                                return (
                                                    <div key={stat} className="rounded-lg bg-black/30 px-2 py-2 text-center">
                                                        <div className="text-[9px] text-gray-600 uppercase tracking-wide">{formatStatName(stat)}</div>
                                                        <div className="text-sm font-bold text-mlbb-neonBlue font-mono">{formatVal(stat, val)}</div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Team Comp Analysis */}
                                {teamCompStats && (
                                    <div className="rounded-xl border border-mlbb-neonBlue/20 bg-mlbb-neonBlue/5 p-4">
                                        <p className="section-label flex items-center gap-2 mb-4">
                                            <Users className="w-3 h-3" /> TAKIM SİNERJİSİ
                                        </p>
                                        <div className="grid grid-cols-2 gap-4">
                                            {/* Power Curve Bars */}
                                            <div>
                                                <p className="text-[10px] text-gray-500 font-mono uppercase mb-2">GÜÇ EĞRİSİ</p>
                                                <div className="flex items-end gap-1.5 h-16 pb-1 border-b border-white/[0.06]">
                                                    {[
                                                        { label: 'Erken', value: teamCompStats.powerScores.early, color: 'bg-mlbb-success' },
                                                        { label: 'Orta', value: teamCompStats.powerScores.mid, color: 'bg-mlbb-gold' },
                                                        { label: 'Geç', value: teamCompStats.powerScores.late, color: 'bg-mlbb-danger' }
                                                    ].map(curve => {
                                                        const total = Object.values(teamCompStats.powerScores).reduce((a, b) => a + b, 0) || 1;
                                                        const height = Math.max(15, (curve.value / total) * 100);
                                                        return (
                                                            <div key={curve.label} className="flex-1 flex flex-col items-center justify-end h-full">
                                                                <div className={`w-full ${curve.color} rounded-t opacity-80`} style={{ height: `${height}%` }} />
                                                                <span className="text-[9px] text-gray-500 mt-1 uppercase">{curve.label}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                            {/* CC Score + Synergies */}
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-[10px] text-gray-500 font-mono uppercase mb-1.5">KİTLE KONTROL</p>
                                                    <div className="flex gap-0.5">
                                                        {[...Array(10)].map((_, i) => (
                                                            <div key={i} className={`h-2 flex-1 rounded-sm ${i < teamCompStats.ccScore ? 'bg-mlbb-purple shadow-[0_0_4px_rgba(124,58,237,0.5)]' : 'bg-gray-800'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                                {teamCompStats.synergies.length > 0 && (
                                                    <div>
                                                        <p className="text-[10px] text-gray-500 font-mono uppercase mb-1.5">SİNERJİLER</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {teamCompStats.synergies.slice(0, 3).map((syn, idx) => (
                                                                <span key={idx} className="text-[9px] bg-mlbb-success/10 text-mlbb-success px-2 py-0.5 rounded border border-mlbb-success/20 whitespace-nowrap">
                                                                    {syn}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {/* Warnings */}
                                        {teamCompStats.warnings.length > 0 && (
                                            <div className="mt-3 space-y-2">
                                                {teamCompStats.warnings.map((warn, idx) => (
                                                    <div key={idx} className="flex items-start gap-2 bg-mlbb-gold/10 border border-mlbb-gold/20 p-2.5 rounded-lg">
                                                        <Lightbulb className="w-4 h-4 text-mlbb-gold shrink-0 mt-0.5" />
                                                        <span className="text-xs text-gray-300 leading-tight">{warn}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Macro Strategy */}
                                {recommendation.macroStrategy && (
                                    <div className="rounded-r-xl border-l-2 border-mlbb-neonBlue bg-mlbb-neonBlue/5 p-4 pl-5">
                                        <p className="section-label flex items-center gap-2 mb-2">
                                            <Map className="w-3 h-3" /> MAKRO STRATEJİ
                                        </p>
                                        <p className="text-gray-300 text-sm leading-relaxed">{recommendation.macroStrategy}</p>
                                    </div>
                                )}

                                {/* Tactical Note */}
                                <div className="pt-4 border-t border-white/[0.06]">
                                    <p className="section-label mb-2">{t('draft_tactical_note')}</p>
                                    <blockquote className="border-l-2 border-mlbb-gold pl-4 text-gray-300 text-sm italic leading-relaxed">
                                        {recommendation.tacticalNote}
                                    </blockquote>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Empty State */
                        <div className="card-glass rounded-2xl border border-dashed border-white/[0.08] flex flex-col items-center justify-center text-center p-12 h-full min-h-[400px]">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 blur-2xl bg-mlbb-neonBlue/10 rounded-full scale-150" />
                                <BrainCircuit className="relative w-16 h-16 text-gray-700" />
                            </div>
                            <p className="text-gray-500 text-base font-display tracking-wider">{t('draft_awaiting')}</p>
                            <p className="text-gray-700 text-xs font-mono mt-2 tracking-widest uppercase">KAHRAMAN SEÇİMİ BEKLENİYOR</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
