// Minimal item data for Telegram Bot Edge Function (Deno runtime)
// Source of truth: src/data/items.ts
// Sync this file whenever items are added/modified in items.ts

export type ItemCategory = 'Attack' | 'Magic' | 'Defense' | 'Movement' | 'Roam' | 'Jungle';

export interface ItemDeno {
  id: string;
  category: ItemCategory;
  hasPhysicalAttack: boolean; // true if stats.physicalAttack > 0
}

export const ITEMS_DENO: Record<string, ItemDeno> = {
  // ===== ATTACK =====
  blade_of_despair:        { id: 'blade_of_despair',        category: 'Attack',    hasPhysicalAttack: true  },
  malefic_roar:            { id: 'malefic_roar',            category: 'Attack',    hasPhysicalAttack: true  },
  demon_hunter_sword:      { id: 'demon_hunter_sword',      category: 'Attack',    hasPhysicalAttack: true  },
  corrosion_scythe:        { id: 'corrosion_scythe',        category: 'Attack',    hasPhysicalAttack: true  },
  golden_staff:            { id: 'golden_staff',            category: 'Attack',    hasPhysicalAttack: true  },
  sea_halberd:             { id: 'sea_halberd',             category: 'Attack',    hasPhysicalAttack: true  },
  hunter_strike:           { id: 'hunter_strike',           category: 'Attack',    hasPhysicalAttack: true  },
  bloodlust_axe:           { id: 'bloodlust_axe',           category: 'Attack',    hasPhysicalAttack: true  },
  rose_gold_meteor:        { id: 'rose_gold_meteor',        category: 'Attack',    hasPhysicalAttack: true  },
  haass_claws:             { id: 'haass_claws',             category: 'Attack',    hasPhysicalAttack: true  },
  berserkers_fury:         { id: 'berserkers_fury',         category: 'Attack',    hasPhysicalAttack: true  },
  endless_battle:          { id: 'endless_battle',          category: 'Attack',    hasPhysicalAttack: true  },
  windtalker:              { id: 'windtalker',              category: 'Attack',    hasPhysicalAttack: false },
  scarlet_phantom:         { id: 'scarlet_phantom',         category: 'Attack',    hasPhysicalAttack: true  },
  war_axe:                 { id: 'war_axe',                 category: 'Attack',    hasPhysicalAttack: true  },
  great_dragon_spear:      { id: 'great_dragon_spear',      category: 'Attack',    hasPhysicalAttack: true  },
  sky_piercer:             { id: 'sky_piercer',             category: 'Attack',    hasPhysicalAttack: true  },

  // ===== MAGIC =====
  holy_crystal:            { id: 'holy_crystal',            category: 'Magic',     hasPhysicalAttack: false },
  blood_wings:             { id: 'blood_wings',             category: 'Magic',     hasPhysicalAttack: false },
  glowing_wand:            { id: 'glowing_wand',            category: 'Magic',     hasPhysicalAttack: false },
  genius_wand:             { id: 'genius_wand',             category: 'Magic',     hasPhysicalAttack: false },
  ice_queens_wand:         { id: 'ice_queens_wand',         category: 'Magic',     hasPhysicalAttack: false },
  lightning_truncheon:     { id: 'lightning_truncheon',     category: 'Magic',     hasPhysicalAttack: false },
  fleeting_time:           { id: 'fleeting_time',           category: 'Magic',     hasPhysicalAttack: false },
  concentrated_energy:     { id: 'concentrated_energy',     category: 'Magic',     hasPhysicalAttack: false },
  divine_glaive:           { id: 'divine_glaive',           category: 'Magic',     hasPhysicalAttack: false },
  feather_of_heaven:       { id: 'feather_of_heaven',       category: 'Magic',     hasPhysicalAttack: false },
  winter_truncheon:        { id: 'winter_truncheon',        category: 'Magic',     hasPhysicalAttack: false },
  enchanted_talisman:      { id: 'enchanted_talisman',      category: 'Magic',     hasPhysicalAttack: false },
  starlium_scythe:         { id: 'starlium_scythe',         category: 'Magic',     hasPhysicalAttack: false },
  wishing_lantern:         { id: 'wishing_lantern',         category: 'Magic',     hasPhysicalAttack: false },
  clock_of_destiny:        { id: 'clock_of_destiny',        category: 'Magic',     hasPhysicalAttack: false },

  // ===== DEFENSE =====
  athenas_shield:          { id: 'athenas_shield',          category: 'Defense',   hasPhysicalAttack: false },
  radiant_armor:           { id: 'radiant_armor',           category: 'Defense',   hasPhysicalAttack: false },
  antique_cuirass:         { id: 'antique_cuirass',         category: 'Defense',   hasPhysicalAttack: false },
  blade_armor:             { id: 'blade_armor',             category: 'Defense',   hasPhysicalAttack: false },
  dominance_ice:           { id: 'dominance_ice',           category: 'Defense',   hasPhysicalAttack: false },
  brute_force_breastplate: { id: 'brute_force_breastplate', category: 'Defense',   hasPhysicalAttack: false },
  thunder_belt:            { id: 'thunder_belt',            category: 'Defense',   hasPhysicalAttack: false },
  cursed_helmet:           { id: 'cursed_helmet',           category: 'Defense',   hasPhysicalAttack: false },
  guardian_helmet:         { id: 'guardian_helmet',         category: 'Defense',   hasPhysicalAttack: false },
  immortality:             { id: 'immortality',             category: 'Defense',   hasPhysicalAttack: false },
  twilight_armor:          { id: 'twilight_armor',          category: 'Defense',   hasPhysicalAttack: false },
  oracle:                  { id: 'oracle',                  category: 'Defense',   hasPhysicalAttack: false },
  queens_wings:            { id: 'queens_wings',            category: 'Defense',   hasPhysicalAttack: false },

  // ===== MOVEMENT (BOOTS) =====
  warrior_boots:           { id: 'warrior_boots',           category: 'Movement',  hasPhysicalAttack: false },
  tough_boots:             { id: 'tough_boots',             category: 'Movement',  hasPhysicalAttack: false },
  magic_shoes:             { id: 'magic_shoes',             category: 'Movement',  hasPhysicalAttack: false },
  arcane_boots:            { id: 'arcane_boots',            category: 'Movement',  hasPhysicalAttack: false },
  swift_boots:             { id: 'swift_boots',             category: 'Movement',  hasPhysicalAttack: false },
  rapid_boots:             { id: 'rapid_boots',             category: 'Movement',  hasPhysicalAttack: false },
  demon_shoes:             { id: 'demon_shoes',             category: 'Movement',  hasPhysicalAttack: false },

  // ===== JUNGLE =====
  ice_retribution:         { id: 'ice_retribution',         category: 'Jungle',    hasPhysicalAttack: false },
  flame_retribution:       { id: 'flame_retribution',       category: 'Jungle',    hasPhysicalAttack: false },
  bloody_retribution:      { id: 'bloody_retribution',      category: 'Jungle',    hasPhysicalAttack: false },

  // ===== ROAM =====
  conceal:                 { id: 'conceal',                 category: 'Roam',      hasPhysicalAttack: false },
  courage_mask:            { id: 'courage_mask',            category: 'Roam',      hasPhysicalAttack: false },
  shadow_mask:             { id: 'shadow_mask',             category: 'Roam',      hasPhysicalAttack: false },
  dire_hit:                { id: 'dire_hit',                category: 'Roam',      hasPhysicalAttack: false },

  // ===== SUB-ITEMS =====
  fury_hammer:             { id: 'fury_hammer',             category: 'Attack',    hasPhysicalAttack: true  },
  vampire_mallet:          { id: 'vampire_mallet',          category: 'Attack',    hasPhysicalAttack: true  },
  legion_sword:            { id: 'legion_sword',            category: 'Attack',    hasPhysicalAttack: true  },
  ogre_tomahawk:           { id: 'ogre_tomahawk',           category: 'Attack',    hasPhysicalAttack: true  },
  elegant_gem:             { id: 'elegant_gem',             category: 'Magic',     hasPhysicalAttack: false },
  magic_wand:              { id: 'magic_wand',              category: 'Magic',     hasPhysicalAttack: false },
  black_ice_shield:        { id: 'black_ice_shield',        category: 'Defense',   hasPhysicalAttack: false },
  silence_robe:            { id: 'silence_robe',            category: 'Defense',   hasPhysicalAttack: false },
  steel_legplates:         { id: 'steel_legplates',         category: 'Defense',   hasPhysicalAttack: false },
  boots_tier1:             { id: 'boots_tier1',             category: 'Movement',  hasPhysicalAttack: false },

  // ===== UTILITY =====
  wind_of_nature:          { id: 'wind_of_nature',          category: 'Attack',    hasPhysicalAttack: true  },
};
