export interface User {
    id: string;
    email: string;
    username: string;
    createdAt: string;
}

export interface PlayerProfile {
    id: string;
    user_id: string;
    nickname: string;
    main_role: string;
    avatar_hero_id: string;
    created_at?: string;
    updated_at?: string;
}

export interface MatchRecord {
    id: string;
    userId: string;
    heroId: string; // The selected hero ID
    kills: number;
    deaths: number;
    assists: number;
    items: string[]; // List of item IDs bought
    result: 'Victory' | 'Defeat';
    hero_id?: string;
    emblem_id?: string;
    emblem_tier1_id?: string;
    emblem_tier2_id?: string;
    emblem_core_id?: string;
    battle_spell_id?: string;
    playstyle_tag?: string;
    coach_note?: string;
    created_at?: string;
}

export interface RecommendedEmblemTree {
    id: string;
    tier1Id: string;
    tier2Id: string;
    coreId: string;
}

export interface DraftRecommendation {
    coreItems: string[];
    situationalItems: string[];
    buildPath: { id: string; isSubItem: boolean }[]; // V6 Build Flow
    macroStrategy?: string; // V6 Macro Strategy 
    recommendedEmblem?: RecommendedEmblemTree;
    recommendedSpell?: string; // id of the spell
    tacticalNote: string;
    buildStats?: Record<string, number>; // Calculated total stats
    economyTactic?: string; // V7 Engine
    winProbability?: { score: number; reasonTag: string }; // V8 Engine
}
