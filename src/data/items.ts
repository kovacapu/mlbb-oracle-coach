export type ItemCategory = 'Attack' | 'Magic' | 'Defense' | 'Movement' | 'Roam' | 'Jungle';

export interface ItemStats {
    physicalAttack?: number;
    magicPower?: number;
    hp?: number;
    mana?: number;
    physicalDefense?: number;
    magicDefense?: number;
    movementSpeed?: number;
    attackSpeed?: number; // Represented as percentage (e.g., 20)
    critChance?: number; // Represented as percentage
    cdr?: number; // Cooldown Reduction percentage
    lifesteal?: number; // Percentage
    spellVamp?: number; // Percentage
    manaRegen?: number;
    hpRegen?: number;
    magicPenetration?: number; // Percentage or flat
    physicalPenetration?: number; // Percentage or flat
}

export interface Item {
    id: string;
    name: string;
    category: ItemCategory;
    baseStats: Record<string, string | number>; // Kept for display/legacy
    stats?: ItemStats; // Deep data core stats
    passiveTags: string[]; // Critical for MLAnalyzer
    iconUrl: string; // URL to the image in public/assets/items/
    tier?: 1 | 2 | 3; // 1: Basic, 2: Advanced, 3: Completed (default)
}

export const ITEMS: Record<string, Item> = {
    // ================= ATTACK =================
    blade_of_despair: { id: 'blade_of_despair', name: 'Umutsuzluğun Kılıcı', category: 'Attack', baseStats: { physicalAttack: 160, movementSpeed: '5%' }, stats: { physicalAttack: 160, movementSpeed: 5 }, passiveTags: ['Execute', 'High Damage', 'Burst'], iconUrl: '/assets/items/blade_of_despair.png' },
    malefic_roar: { id: 'malefic_roar', name: 'Uğursuz Kükreme', category: 'Attack', baseStats: { physicalAttack: 60 }, stats: { physicalAttack: 60, physicalPenetration: 20 }, passiveTags: ['Armor-Pen', 'Anti-Defense'], iconUrl: '/assets/items/malefic_roar.png' },
    demon_hunter_sword: { id: 'demon_hunter_sword', name: 'Şeytan Avcısı Kılıcı', category: 'Attack', baseStats: { physicalAttack: 35, attackSpeed: '25%' }, stats: { physicalAttack: 35, attackSpeed: 25 }, passiveTags: ['Anti-Tank/HP-Based', 'Lifesteal', 'DPS'], iconUrl: '/assets/items/demon_hunter_sword.png' },
    corrosion_scythe: { id: 'corrosion_scythe', name: 'Korozyon Tırpanı', category: 'Attack', baseStats: { physicalAttack: 30, attackSpeed: '35%', movementSpeed: '5%' }, stats: { physicalAttack: 30, attackSpeed: 35, movementSpeed: 5 }, passiveTags: ['Slow', 'Attack Speed', 'DPS'], iconUrl: '/assets/items/corrosion_scythe.png' },
    golden_staff: { id: 'golden_staff', name: 'Altın Asa', category: 'Attack', baseStats: { physicalAttack: 65, attackSpeed: '15%' }, stats: { physicalAttack: 65, attackSpeed: 15 }, passiveTags: ['Attack Speed', 'Passive Enabler', 'DPS'], iconUrl: '/assets/items/golden_staff.png' },
    sea_halberd: { id: 'sea_halberd', name: 'Deniz Halberdı', category: 'Attack', baseStats: { physicalAttack: 80, attackSpeed: '25%' }, stats: { physicalAttack: 80, attackSpeed: 25 }, passiveTags: ['Anti-Heal', 'Anti-Shield', 'Burst'], iconUrl: '/assets/items/sea_halberd.png' },
    hunter_strike: { id: 'hunter_strike', name: 'Avcı Darbesi', category: 'Attack', baseStats: { physicalAttack: 80, cdr: '10%' }, stats: { physicalAttack: 80, cdr: 10, physicalPenetration: 15 }, passiveTags: ['Armor-Pen', 'Mobility', 'Burst'], iconUrl: '/assets/items/hunter_strike.png' },
    bloodlust_axe: { id: 'bloodlust_axe', name: 'Kan Hırsı Baltası', category: 'Attack', baseStats: { physicalAttack: 70, cdr: '10%' }, stats: { physicalAttack: 70, cdr: 10, spellVamp: 20 }, passiveTags: ['Spell Vamp', 'Sustain'], iconUrl: '/assets/items/bloodlust_axe.png' },
    rose_gold_meteor: { id: 'rose_gold_meteor', name: 'Gül Altın Meteor', category: 'Attack', baseStats: { physicalAttack: 60, magicDefense: 30, lifesteal: '5%' }, stats: { physicalAttack: 60, magicDefense: 30, lifesteal: 5 }, passiveTags: ['Magic Shield', 'Anti-Burst', 'Sustain'], iconUrl: '/assets/items/rose_gold_meteor.png' },
    haass_claws: { id: 'haass_claws', name: 'Haas\'ın Pençeleri', category: 'Attack', baseStats: { physicalAttack: 30, critChance: '20%' }, stats: { physicalAttack: 30, critChance: 20, lifesteal: 20 }, passiveTags: ['Lifesteal', 'Sustain', 'Crit'], iconUrl: '/assets/items/haass_claws.png' },
    berserkers_fury: { id: 'berserkers_fury', name: 'Berserker\'ın Öfkesi', category: 'Attack', baseStats: { physicalAttack: 65, critChance: '25%' }, stats: { physicalAttack: 65, critChance: 25 }, passiveTags: ['Crit Damage', 'Burst'], iconUrl: '/assets/items/berserkers_fury.png' },
    endless_battle: { id: 'endless_battle', name: 'Sonsuz Savaş', category: 'Attack', baseStats: { physicalAttack: 65, manaRegen: 5, hp: 250, cdr: '10%', movementSpeed: '5%', lifesteal: '10%' }, stats: { physicalAttack: 65, manaRegen: 5, hp: 250, cdr: 10, movementSpeed: 5, lifesteal: 10 }, passiveTags: ['True Damage', 'Sustain', 'Combo'], iconUrl: '/assets/items/endless_battle.png' },
    windtalker: { id: 'windtalker', name: 'Rüzgar Konuşanı', category: 'Attack', baseStats: { attackSpeed: '40%', movementSpeed: 20, critChance: '10%' }, stats: { attackSpeed: 40, movementSpeed: 20, critChance: 10 }, passiveTags: ['Mobility', 'Magic Damage', 'AoE'], iconUrl: '/assets/items/windtalker.png' },
    scarlet_phantom: { id: 'scarlet_phantom', name: 'Kızıl Hayalet', category: 'Attack', baseStats: { physicalAttack: 30, attackSpeed: '20%', critChance: '25%' }, stats: { physicalAttack: 30, attackSpeed: 20, critChance: 25 }, passiveTags: ['Attack Speed', 'Crit'], iconUrl: '/assets/items/scarlet_phantom.png' },
    war_axe: { id: 'war_axe', name: 'Savaş Baltası', category: 'Attack', baseStats: { physicalAttack: 25, hp: 550, cdr: '10%' }, stats: { physicalAttack: 25, hp: 550, cdr: 10, spellVamp: 12 }, passiveTags: ['True Damage', 'Sustain', 'Scaling', 'Spell Vamp'], iconUrl: '/assets/items/war_axe.png' },
    great_dragon_spear: { id: 'great_dragon_spear', name: 'Büyük Ejderha Mızrağı', category: 'Attack', baseStats: { physicalAttack: 70, cdr: '10%', critChance: '20%' }, stats: { physicalAttack: 70, cdr: 10, critChance: 20 }, passiveTags: ['Mobility', 'Ultimate Boost', 'Burst'], iconUrl: '/assets/items/great_dragon_spear.png' },
    sky_piercer: { id: 'sky_piercer', name: 'Gök Delici', category: 'Attack', baseStats: { physicalAttack: 60, movementSpeed: 20 }, stats: { physicalAttack: 60, movementSpeed: 20 }, passiveTags: ['Execute', 'Stacking', 'Snowball'], iconUrl: '/assets/items/sky_piercer.png' },

    // ================= MAGIC =================
    holy_crystal: { id: 'holy_crystal', name: 'Kutsal Kristal', category: 'Magic', baseStats: { magicPower: 185 }, stats: { magicPower: 185 }, passiveTags: ['Scaling Magic', 'Burst'], iconUrl: '/assets/items/holy_crystal.png' },
    blood_wings: { id: 'blood_wings', name: 'Kan Kanatları', category: 'Magic', baseStats: { magicPower: 175, hp: 500 }, stats: { magicPower: 175, hp: 500 }, passiveTags: ['High Damage', 'Shield', 'Sustain'], iconUrl: '/assets/items/blood_wings.png' },
    glowing_wand: { id: 'glowing_wand', name: 'Parlayan Asa', category: 'Magic', baseStats: { magicPower: 75, hp: 400, movementSpeed: '5%' }, stats: { magicPower: 75, hp: 400, movementSpeed: 5 }, passiveTags: ['Anti-Tank/HP-Based', 'Burn', 'Anti-Heal'], iconUrl: '/assets/items/glowing_wand.png' },
    genius_wand: { id: 'genius_wand', name: 'Deha Asası', category: 'Magic', baseStats: { magicPower: 75, movementSpeed: '5%' }, stats: { magicPower: 75, movementSpeed: 5, magicPenetration: 10 }, passiveTags: ['Magic-Pen', 'Anti-Defense', 'Snowball'], iconUrl: '/assets/items/genius_wand.png' },
    ice_queens_wand: { id: 'ice_queens_wand', name: 'Buz Kraliçesi\'nin Asası', category: 'Magic', baseStats: { magicPower: 75, spellVamp: '10%', mana: 150, movementSpeed: '7%' }, stats: { magicPower: 75, spellVamp: 10, mana: 150, movementSpeed: 7 }, passiveTags: ['Slow', 'Sustain', 'Control'], iconUrl: '/assets/items/ice_queens_wand.png' },
    lightning_truncheon: { id: 'lightning_truncheon', name: 'Şimşek Copusu', category: 'Magic', baseStats: { magicPower: 75, mana: 400, cdr: '10%' }, stats: { magicPower: 75, mana: 400, cdr: 10 }, passiveTags: ['Burst', 'AoE', 'Mobility'], iconUrl: '/assets/items/lightning_truncheon.png' },
    fleeting_time: { id: 'fleeting_time', name: 'Geçici Zaman', category: 'Magic', baseStats: { magicPower: 70, mana: 350, cdr: '15%' }, stats: { magicPower: 70, mana: 350, cdr: 15 }, passiveTags: ['Ultimate CDR', 'Snowball'], iconUrl: '/assets/items/fleeting_time.png' },
    concentrated_energy: { id: 'concentrated_energy', name: 'Yoğunlaştırılmış Enerji', category: 'Magic', baseStats: { magicPower: 70, hp: 400 }, stats: { magicPower: 70, hp: 400, spellVamp: 20 }, passiveTags: ['Spell Vamp', 'Sustain'], iconUrl: '/assets/items/concentrated_energy.png' },
    divine_glaive: { id: 'divine_glaive', name: 'İlahi Yiv', category: 'Magic', baseStats: { magicPower: 65 }, stats: { magicPower: 65, magicPenetration: 35 }, passiveTags: ['Magic-Pen', 'Anti-Defense', 'Burst'], iconUrl: '/assets/items/divine_glaive.png' },
    feather_of_heaven: { id: 'feather_of_heaven', name: 'Cennet Tüyü', category: 'Magic', baseStats: { magicPower: 55, attackSpeed: '20%', cdr: '5%' }, stats: { magicPower: 55, attackSpeed: 20, cdr: 5 }, passiveTags: ['Attack Speed', 'DPS', 'Magic Core'], iconUrl: '/assets/items/feather_of_heaven.png' },
    winter_truncheon: { id: 'winter_truncheon', name: 'Kış Tacı', category: 'Magic', baseStats: { magicPower: 60, physicalDefense: 25, hp: 400 }, stats: { magicPower: 60, physicalDefense: 25, hp: 400 }, passiveTags: ['Freeze', 'Immunity', 'Anti-Burst'], iconUrl: '/assets/items/winter_truncheon.png' },
    enchanted_talisman: { id: 'enchanted_talisman', name: 'Büyülü Tılsım', category: 'Magic', baseStats: { magicPower: 50, hp: 250, cdr: '20%' }, stats: { magicPower: 50, hp: 250, cdr: 20, manaRegen: 15 }, passiveTags: ['Mana Regen', 'Spam', 'CDR'], iconUrl: '/assets/items/enchanted_talisman.png' },
    starlium_scythe: { id: 'starlium_scythe', name: 'Yıldız Tırpanı', category: 'Magic', baseStats: { magicPower: 70, cdr: '10%', lifesteal: '8%', manaRegen: 6 }, stats: { magicPower: 70, cdr: 10, lifesteal: 8, manaRegen: 6 }, passiveTags: ['True Damage', 'Combo', 'Hybrid'], iconUrl: '/assets/items/starlium_scythe.png' },
    wishing_lantern: { id: 'wishing_lantern', name: 'Dilek Feneri', category: 'Magic', baseStats: { magicPower: 70, cdr: '10%' }, stats: { magicPower: 70, cdr: 10 }, passiveTags: ['Anti-Tank/HP-Based', 'Burst'], iconUrl: '/assets/items/wishing_lantern.png' },
    clock_of_destiny: { id: 'clock_of_destiny', name: 'Kader Saati', category: 'Magic', baseStats: { magicPower: 45, mana: 400, hp: 400, cdr: '10%' }, stats: { magicPower: 45, mana: 400, hp: 400, cdr: 10 }, passiveTags: ['Stacking Magic', 'Late Game', 'Scaling'], iconUrl: '/assets/items/clock_of_destiny.png' },

    // ================= DEFENSE =================
    athenas_shield: { id: 'athenas_shield', name: 'Athena\'nın Kalkanı', category: 'Defense', baseStats: { hp: 900, magicDefense: 62, hpRegen: 2 }, stats: { hp: 900, magicDefense: 62, hpRegen: 2 }, passiveTags: ['Magic Shield', 'Anti-Burst'], iconUrl: '/assets/items/athenas_shield.png' },
    radiant_armor: { id: 'radiant_armor', name: 'Parlak Zırh', category: 'Defense', baseStats: { hp: 950, magicDefense: 52, hpRegen: 12 }, stats: { hp: 950, magicDefense: 52, hpRegen: 12 }, passiveTags: ['Anti-DPS Magic', 'Sustain'], iconUrl: '/assets/items/radiant_armor.png' },
    antique_cuirass: { id: 'antique_cuirass', name: 'Antika Göğüslük', category: 'Defense', baseStats: { hp: 920, physicalDefense: 54, hpRegen: 4 }, stats: { hp: 920, physicalDefense: 54, hpRegen: 4 }, passiveTags: ['Anti-Physical Damage', 'Debuff'], iconUrl: '/assets/items/antique_cuirass.png' },
    blade_armor: { id: 'blade_armor', name: 'Kılıç Zırh', category: 'Defense', baseStats: { physicalDefense: 90 }, stats: { physicalDefense: 90 }, passiveTags: ['Anti-Crit', 'Anti-Marksman', 'Reflect'], iconUrl: '/assets/items/blade_armor.png' },
    dominance_ice: { id: 'dominance_ice', name: 'Buz Hâkimiyeti', category: 'Defense', baseStats: { mana: 500, physicalDefense: 70, movementSpeed: '5%' }, stats: { mana: 500, physicalDefense: 70, movementSpeed: 5 }, passiveTags: ['Anti-Heal', 'Anti-Attack-Speed', 'Anti-Marksman'], iconUrl: '/assets/items/dominance_ice.png' },
    brute_force_breastplate: { id: 'brute_force_breastplate', name: 'Kaba Kuvvet Göğüsü', category: 'Defense', baseStats: { hp: 600, physicalDefense: 30, cdr: '10%' }, stats: { hp: 600, physicalDefense: 30, cdr: 10 }, passiveTags: ['Mobility', 'Stacking Defense', 'Hybrid'], iconUrl: '/assets/items/brute_force_breastplate.png' },
    thunder_belt: { id: 'thunder_belt', name: 'Gök Gürültüsü Kemeri', category: 'Defense', baseStats: { hp: 800, manaRegen: 10, cdr: '10%', physicalDefense: 15, magicDefense: 15 }, stats: { hp: 800, manaRegen: 10, cdr: 10, physicalDefense: 15, magicDefense: 15 }, passiveTags: ['True Damage', 'Slow', 'Stacking Defense'], iconUrl: '/assets/items/thunder_belt.png' },
    cursed_helmet: { id: 'cursed_helmet', name: 'Lanetli Miğfer', category: 'Defense', baseStats: { hp: 1200, magicDefense: 25 }, stats: { hp: 1200, magicDefense: 25 }, passiveTags: ['Wave Clear', 'Burn', 'HP Scaling'], iconUrl: '/assets/items/cursed_helmet.png' },
    guardian_helmet: { id: 'guardian_helmet', name: 'Koruyucu Miğfer', category: 'Defense', baseStats: { hp: 1550, hpRegen: 20 }, stats: { hp: 1550, hpRegen: 20 }, passiveTags: ['Out-of-Combat Regen', 'Sustain', 'Tank Core'], iconUrl: '/assets/items/guardian_helmet.png' },
    immortality: { id: 'immortality', name: 'Ölümsüzlük', category: 'Defense', baseStats: { hp: 800, physicalDefense: 20 }, stats: { hp: 800, physicalDefense: 20 }, passiveTags: ['Revive', 'Late Game', 'Survivability'], iconUrl: '/assets/items/immortality.png' },
    twilight_armor: { id: 'twilight_armor', name: 'Alacakaranlık Zırhı', category: 'Defense', baseStats: { hp: 1200, physicalDefense: 20 }, stats: { hp: 1200, physicalDefense: 20 }, passiveTags: ['Anti-Burst', 'Tank Damage'], iconUrl: '/assets/items/twilight_armor.png' },
    oracle: { id: 'oracle', name: 'Kahin', category: 'Defense', baseStats: { hp: 850, magicDefense: 42, cdr: '10%' }, stats: { hp: 850, magicDefense: 42, cdr: 10 }, passiveTags: ['Heal Boost', 'Shield Boost', 'Sustain'], iconUrl: '/assets/items/oracle.png' },
    queens_wings: { id: 'queens_wings', name: 'Kraliçe\'nin Kanatları', category: 'Defense', baseStats: { hp: 600, cdr: '10%', spellVamp: '5%' }, stats: { hp: 600, cdr: 10, spellVamp: 5 }, passiveTags: ['Damage Reduction', 'Anti-Burst', 'Sustain'], iconUrl: '/assets/items/queens_wings.png' },

    // ================= MOVEMENT (BOOTS) =================
    warrior_boots: { id: 'warrior_boots', name: 'Savaşçı Botları', category: 'Movement', baseStats: { movementSpeed: 40, physicalDefense: 22 }, stats: { movementSpeed: 40, physicalDefense: 22 }, passiveTags: ['Stacking Physical Defense', 'Anti-Physical'], iconUrl: '/assets/items/warrior_boots.png' },
    tough_boots: { id: 'tough_boots', name: 'Sağlam Botlar', category: 'Movement', baseStats: { movementSpeed: 40, magicDefense: 22 }, stats: { movementSpeed: 40, magicDefense: 22 }, passiveTags: ['CC Reduction', 'Anti-Magic'], iconUrl: '/assets/items/tough_boots.png' },
    magic_shoes: { id: 'magic_shoes', name: 'Büyü Ayakkabıları', category: 'Movement', baseStats: { movementSpeed: 40, cdr: '10%' }, stats: { movementSpeed: 40, cdr: 10 }, passiveTags: ['CDR', 'Spam'], iconUrl: '/assets/items/magic_shoes.png' },
    arcane_boots: { id: 'arcane_boots', name: 'Gizem Botları', category: 'Movement', baseStats: { movementSpeed: 40, magicPenetration: 10 }, stats: { movementSpeed: 40, magicPenetration: 10 }, passiveTags: ['Magic-Pen', 'Burst'], iconUrl: '/assets/items/arcane_boots.png' },
    swift_boots: { id: 'swift_boots', name: 'Hızlı Botlar', category: 'Movement', baseStats: { movementSpeed: 40, attackSpeed: '15%' }, stats: { movementSpeed: 40, attackSpeed: 15 }, passiveTags: ['Attack Speed', 'DPS'], iconUrl: '/assets/items/swift_boots.png' },
    rapid_boots: { id: 'rapid_boots', name: 'Çabuk Botlar', category: 'Movement', baseStats: { movementSpeed: 70 }, stats: { movementSpeed: 70 }, passiveTags: ['High Mobility', 'Roam', 'Slow Immune'], iconUrl: '/assets/items/rapid_boots.png' },
    demon_shoes: { id: 'demon_shoes', name: 'Şeytan Ayakkabıları', category: 'Movement', baseStats: { movementSpeed: 40, manaRegen: 6 }, stats: { movementSpeed: 40, manaRegen: 6 }, passiveTags: ['Mana Regen', 'Sustain'], iconUrl: '/assets/items/demon_shoes.png' },

    // ================= JUNGLE BOOTS =================
    ice_retribution: { id: 'ice_retribution', name: 'Buz İntikamı', category: 'Jungle', baseStats: {}, stats: {}, passiveTags: ['Movement Steal', 'Jungle'], iconUrl: '/assets/items/ice_retribution.png' },
    flame_retribution: { id: 'flame_retribution', name: 'Alev İntikamı', category: 'Jungle', baseStats: {}, stats: {}, passiveTags: ['Damage Steal', 'Jungle'], iconUrl: '/assets/items/flame_retribution.png' },
    bloody_retribution: { id: 'bloody_retribution', name: 'Kanlı İntikam', category: 'Jungle', baseStats: {}, stats: {}, passiveTags: ['HP Steal', 'Jungle'], iconUrl: '/assets/items/bloody_retribution.png' },

    // ================= ROAM BOOTS =================
    conceal: { id: 'conceal', name: 'Gizlenme', category: 'Roam', baseStats: {}, stats: {}, passiveTags: ['Invisibility', 'Roam'], iconUrl: '/assets/items/conceal.png' },
    courage_mask: { id: 'courage_mask', name: 'Cesaret Maskesi', category: 'Roam', baseStats: { hp: 700, cdr: '10%' }, stats: { hp: 700, cdr: 10 }, passiveTags: ['Team Buff', 'Aura'], iconUrl: '/assets/items/courage_mask.png' },
    shadow_mask: { id: 'shadow_mask', name: 'Gölge Maskesi', category: 'Roam', baseStats: { hp: 700, cdr: '10%' }, stats: { hp: 700, cdr: 10 }, passiveTags: ['Conceal', 'Initiation'], iconUrl: '/assets/items/shadow_mask.png' },
    dire_hit: { id: 'dire_hit', name: 'Şiddetli Vuruş', category: 'Roam', baseStats: {}, stats: {}, passiveTags: ['Execute', 'Roam'], iconUrl: '/assets/items/dire_hit.png' },

    // ================= SUB-ITEMS (Tier 1 & 2) =================
    fury_hammer: { id: 'fury_hammer', name: 'Öfke Çekici', category: 'Attack', tier: 2, baseStats: { physicalAttack: 35 }, stats: { physicalAttack: 35, physicalPenetration: 12 }, passiveTags: ['Early Pen', 'Snowball'], iconUrl: '/assets/items/fury_hammer.png' },
    vampire_mallet: { id: 'vampire_mallet', name: 'Vampir Tokmağı', category: 'Attack', tier: 1, baseStats: { physicalAttack: 8, lifesteal: '8%' }, stats: { physicalAttack: 8, lifesteal: 8 }, passiveTags: ['Lifesteal', 'Sustain'], iconUrl: '/assets/items/vampire_mallet.png' },
    legion_sword: { id: 'legion_sword', name: 'Lejyon Kılıcı', category: 'Attack', tier: 2, baseStats: { physicalAttack: 60 }, stats: { physicalAttack: 60 }, passiveTags: ['Raw Damage'], iconUrl: '/assets/items/legion_sword.png' },
    ogre_tomahawk: { id: 'ogre_tomahawk', name: 'Dev Tomahawk', category: 'Attack', tier: 2, baseStats: { physicalAttack: 30, hp: 230 }, stats: { physicalAttack: 30, hp: 230 }, passiveTags: ['Bruiser'], iconUrl: '/assets/items/ogre_tomahawk.png' },
    elegant_gem: { id: 'elegant_gem', name: 'Zarif Mücevher', category: 'Magic', tier: 2, baseStats: { hp: 300, mana: 380 }, stats: { hp: 300, mana: 380 }, passiveTags: ['Level Up Regen', 'Sustain'], iconUrl: '/assets/items/elegant_gem.png' },
    magic_wand: { id: 'magic_wand', name: 'Büyü Değneği', category: 'Magic', tier: 2, baseStats: { magicPower: 45 }, stats: { magicPower: 45 }, passiveTags: ['Raw Magic'], iconUrl: '/assets/items/magic_wand.png' },
    black_ice_shield: { id: 'black_ice_shield', name: 'Kara Buz Kalkanı', category: 'Defense', tier: 2, baseStats: { mana: 400, physicalDefense: 22, cdr: '10%' }, stats: { mana: 400, physicalDefense: 22, cdr: 10 }, passiveTags: ['Defense', 'CDR'], iconUrl: '/assets/items/black_ice_shield.png' },
    silence_robe: { id: 'silence_robe', name: 'Sessizlik Cübbesi', category: 'Defense', tier: 2, baseStats: { hp: 540, magicDefense: 30 }, stats: { hp: 540, magicDefense: 30 }, passiveTags: ['Magic Defense'], iconUrl: '/assets/items/silence_robe.png' },
    steel_legplates: { id: 'steel_legplates', name: 'Çelik Bacaklıklar', category: 'Defense', tier: 2, baseStats: { physicalDefense: 45 }, stats: { physicalDefense: 45 }, passiveTags: ['Physical Defense'], iconUrl: '/assets/items/steel_legplates.png' },
    boots_tier1: { id: 'boots_tier1', name: 'Botlar', category: 'Movement', tier: 1, baseStats: { movementSpeed: 20 }, stats: { movementSpeed: 20 }, passiveTags: ['Mobility'], iconUrl: '/assets/items/boots_tier1.png' },

    // ================= ENEMY ONLY (FOR MLANALYZER LOGIC) =================
    wind_of_nature: { id: 'wind_of_nature', name: 'Doğanın Rüzgarı', category: 'Attack', baseStats: { physicalAttack: 30, attackSpeed: '20%', lifesteal: '10%' }, stats: { physicalAttack: 30, attackSpeed: 20, lifesteal: 10 }, passiveTags: ['Physical Immunity', 'Anti-Physical Burst'], iconUrl: '/assets/items/wind_of_nature.png' }
};

export const getItemById = (id: string): Item | undefined => ITEMS[id];
export const getAllItems = (): Item[] => Object.values(ITEMS);
export const getItemsByCategory = (category: ItemCategory): Item[] => getAllItems().filter(item => item.category === category);
