import { getHeroById } from '../data/heroes';

export interface WinProbResult {
    score: number; // 0 to 100
    reasonTag: string; // Translation key
}

/**
 * Advanced V8 Win Probability Engine
 * Analyzes team synergy, counter advantages, meta tiers, and match flow.
 */
export const calculateWinProbability = (alliedHeroIds: string[], enemyHeroIds: string[]): WinProbResult => {
    let baseScore = 50; // Neutral starting point

    if (alliedHeroIds.length === 0) {
        return { score: baseScore, reasonTag: 'winprob_reason_neutral' };
    }

    let synergyBonus = 0;
    let metaBonus = 0;
    let counterBonus = 0;
    let earlyGameCount = 0;
    let lateGameCount = 0;
    let ccCount = 0;
    let burstCount = 0;

    // Scan Allies
    for (const id of alliedHeroIds) {
        const hero = getHeroById(id);
        if (!hero) continue;

        // Meta Weight
        if (hero.metaTier === 'S+') metaBonus += 3;
        else if (hero.metaTier === 'S') metaBonus += 2;
        else if (hero.metaTier === 'A') metaBonus += 1;
        else if (hero.metaTier === 'C') metaBonus -= 1;

        // Power Spikes
        if (hero.powerSpike === 'Early') earlyGameCount++;
        if (hero.powerSpike === 'Late') lateGameCount++;

        // Concepts
        if (hero.tags?.includes('CC')) ccCount++;
        if (hero.tags?.includes('Burst')) burstCount++;

        // Counter Checks
        for (const enemyId of enemyHeroIds) {
            // If the hero strongly counters an enemy picked
            if (hero.strongAgainst?.includes(enemyId)) {
                counterBonus += 2;
            }
            // If the hero is weak against an enemy picked
            if (hero.weakAgainst?.includes(enemyId)) {
                counterBonus -= 2;
            }
        }
    }

    // Synergy Computations
    if (ccCount >= 2 && burstCount >= 1) {
        synergyBonus += 5; // Good engage + follow up
    }

    let reasonTag = 'winprob_reason_neutral';

    if (lateGameCount > 3) {
        synergyBonus -= 10; // Too greedy, will get crushed early
        reasonTag = 'winprob_reason_greedy_late';
    } else if (earlyGameCount > 3) {
        synergyBonus -= 5; // Must end fast, drops off hard
        reasonTag = 'winprob_reason_rush_early';
    } else if (alliedHeroIds.length >= 3 && ccCount === 0) {
        synergyBonus -= 8; // No crowd control
        reasonTag = 'winprob_reason_no_cc';
    } else if (counterBonus > 4) {
        reasonTag = 'winprob_reason_hard_counter';
    } else if (counterBonus < -4) {
        reasonTag = 'winprob_reason_countered';
    } else if (metaBonus > 6) {
        reasonTag = 'winprob_reason_meta_abuser';
    } else if (synergyBonus > 0 && counterBonus >= 0) {
        reasonTag = 'winprob_reason_solid_draft';
    }

    // Cap values to prevent breakages
    const finalScore = Math.min(100, Math.max(0, baseScore + metaBonus + counterBonus + synergyBonus));

    return {
        score: Math.round(finalScore),
        reasonTag
    };
};
