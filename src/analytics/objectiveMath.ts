export interface ObjectiveStats {
    name: string;
    hp: number;
    physicalDefense: number;
    magicalDefense: number;
    attack: number;
    type: 'Turtle' | 'Lord' | 'Evolved Lord' | 'Luminous Lord' | 'Outer Turret' | 'Inner Turret' | 'Inhibitor Turret' | 'Base' | 'None';
}

/**
 * Calculates the current objective stats based on match minute (2026 Meta).
 */
export const calculateObjectiveCurrentStats = (minute: number): Record<string, ObjectiveStats> => {
    // 2026 Scaling Rules (Approximated for MLBB Meta)

    // Turtle (Leaves at 8:00)
    let turtle: ObjectiveStats = {
        name: 'Kaplumbağa',
        type: minute < 8 ? 'Turtle' : 'None',
        hp: minute < 8 ? 5000 + (minute * 800) : 0, // Scales up to ~11k
        physicalDefense: 35 + (minute * 2),
        magicalDefense: 35 + (minute * 2),
        attack: 250 + (minute * 15)
    };

    // Lord Scaling
    let lordType: ObjectiveStats['type'] = 'None';
    let lordHp = 0;
    let lordDef = 0;
    let lordAttack = 0;

    if (minute >= 8 && minute < 12) {
        lordType = 'Lord';
        lordHp = 12000 + ((minute - 8) * 1000);
        lordDef = 50 + ((minute - 8) * 3);
        lordAttack = 400 + ((minute - 8) * 20);
    } else if (minute >= 12 && minute < 18) {
        lordType = 'Evolved Lord';
        lordHp = 17000 + ((minute - 12) * 1500);
        lordDef = 70 + ((minute - 12) * 4);
        lordAttack = 600 + ((minute - 12) * 30);
    } else if (minute >= 18) {
        lordType = 'Luminous Lord';
        lordHp = 27000 + ((minute - 18) * 2500); // Massive late game scaling
        lordDef = 100 + ((minute - 18) * 5);
        lordAttack = 1000 + ((minute - 18) * 50);
    }

    let lord: ObjectiveStats = {
        name: lordType === 'None' ? 'Henüz Çıkmadı' : lordType,
        type: lordType,
        hp: lordHp,
        physicalDefense: lordDef,
        magicalDefense: lordDef,
        attack: lordAttack
    };

    // Turret Shield logic (first 5 minutes)
    let outerTurret: ObjectiveStats = {
        name: 'Dış Kule (Outer)',
        type: 'Outer Turret',
        hp: 4500,
        physicalDefense: minute < 5 ? 120 : 60, // Energy Shield protection
        magicalDefense: minute < 5 ? 120 : 60,
        attack: 350 + (minute * 20), // Towers gradually deal more damage over time if minion-less
    }

    return {
        turtle,
        lord,
        outerTurret
    };
};
