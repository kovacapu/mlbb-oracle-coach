export interface EconomyTactic {
    gapState: 'Dominating' | 'Leading' | 'Even' | 'Falling Behind' | 'Crushed';
    goldDifference: number; // Approximate
    suggestedActionTR: string;
    suggestedActionEN: string;
}

/**
 * Calculates the FarmGap based on estimated GPM (Gold Per Minute) and match minute.
 * Compares player's economy against the expected 2026 Meta Baseline.
 */
export const calculateFarmGap = (playerGold: number, minute: number, role: string): EconomyTactic => {
    // If no data, assume a basic ongoing match scenario
    if (!playerGold || minute <= 0) {
        return {
            gapState: 'Even',
            goldDifference: 0,
            suggestedActionTR: "Güvenli farm yap, harita turlarına ormancınla katıl.",
            suggestedActionEN: "Farm safely, join map rotations with your jungler."
        };
    }

    // Baseline GPM (Gold Per Minute) expectations per role in 2026 meta
    let expectedGPM = 500; // Baseline
    if (role === 'Marksman' || role === 'Assassin') {
        expectedGPM = 750; // Core carries need heavy gold
    } else if (role === 'Fighter' || role === 'Mage') {
        expectedGPM = 600;
    } else if (role === 'Support' || role === 'Tank') {
        expectedGPM = 400; // Roamers rely on passive gold + assists
    }

    const expectedGold = expectedGPM * minute;
    const goldDifference = playerGold - expectedGold;

    let gapState: EconomyTactic['gapState'] = 'Even';
    let tr = "";
    let en = "";

    if (goldDifference >= 2000) {
        gapState = 'Dominating';
        tr = "Şartları sen belirliyorsun (Snowball). Derhal Lord/Turtle gibi harita görevlerine baskı kur veya rakip ormanı istila et (Invade).";
        en = "You are snowballing hard. Force map objectives (Lord/Turtle) immediately or invade the enemy jungle.";
    } else if (goldDifference >= 800) {
        gapState = 'Leading';
        tr = "Altın avantajın var. Rakibi kule altında kalmaya zorla (Freeze Lane) ve görüş alarak pusular kur.";
        en = "You have a solid gold lead. Freeze the lane to deny farm and set up vision for ambushes.";
    } else if (goldDifference > -800) {
        gapState = 'Even';
        tr = "Ekonomi dengede. Takım savaşlarında (Teamfight) ilk hatayı yapan kaybeder, pozisyonunu koru.";
        en = "Economy is dead even. The first mistake in a teamfight loses the game, hold your position safely.";
    } else if (goldDifference > -2000) {
        gapState = 'Falling Behind';
        tr = "Altın olarak geridesin. Kule altına çekil (Hug Tower), tek başına dolaşma ve sadece defansif takaslara gir.";
        en = "You are falling behind in gold. Hug your tower, strictly avoid solo roaming, and take only defensive trades.";
    } else {
        gapState = 'Crushed';
        tr = "Ciddi ekonomik kriz! Bırak iç kuleler düşsün, sadece yüksek kule (Inhibitor) savunmasına odaklan ve bedava farmları (Split) topla.";
        en = "Severe economic crisis! Let inner towers fall, focus strictly on Inhibitor defense, and collect safe split-push farm.";
    }

    return {
        gapState,
        goldDifference,
        suggestedActionTR: tr,
        suggestedActionEN: en
    };
};
