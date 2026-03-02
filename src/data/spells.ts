export interface Spell {
    id: string;
    name: string;
    description: string;
    cooldown: number; // in seconds
    iconUrl: string; // URL to the image in public/assets/spells/
}

export const SPELLS: Record<string, Spell> = {
    execute: {
        id: 'execute',
        name: 'Execute',
        description: 'Deals 100 (+10 * Hero Level) plus 13% of the target\'s lost HP as True Damage to an enemy. If Execute kills the target, its cooldown is reduced by 40%.',
        cooldown: 90,
        iconUrl: '/assets/spells/execute.png'
    },
    retribution: {
        id: 'retribution',
        name: 'Retribution',
        description: 'Deals 520 (+80 * Hero Level) True Damage to Creeps or Minions. Passive: Increases rewards from Creeps and reduces damage taken from them. Can be upgraded to Ice, Flame, or Bloody Retribution.',
        cooldown: 35,
        iconUrl: '/assets/spells/retribution.png'
    },
    inspire: {
        id: 'inspire',
        name: 'Inspire',
        description: 'Enhances the next 8 Basic Attacks within 5s. Increases Attack Speed by 55% (cap to 500%) and ignores 8 (+1 * Hero Level) Physical Defense. Basic Attacks restore HP.',
        cooldown: 75,
        iconUrl: '/assets/spells/inspire.png'
    },
    sprint: {
        id: 'sprint',
        name: 'Sprint',
        description: 'Gains 50% extra Movement Speed that decays over 6s. Grants immunity to slow effects for the first 2s.',
        cooldown: 100,
        iconUrl: '/assets/spells/sprint.png'
    },
    revitalize: {
        id: 'revitalize',
        name: 'Revitalize',
        description: 'Summons a Healing Spring that restores 2.5% Max HP every 0.5s for allies within it. Enhances Shield and HP Regen effects by 25%. Lasts 4s.',
        cooldown: 100,
        iconUrl: '/assets/spells/revitalize.png'
    },
    aegis: {
        id: 'aegis',
        name: 'Aegis',
        description: 'Grants a shield that absorbs 750 (+50 * Hero Level) damage for 5s. The allied hero with the lowest HP nearby also gets 70% of the shield.',
        cooldown: 90,
        iconUrl: '/assets/spells/aegis.png'
    },
    petrify: {
        id: 'petrify',
        name: 'Petrify',
        description: 'Deals 100 (+15 * Hero Level) Magic Damage to nearby enemies and petrifies them for 0.8s, slowing them afterward.',
        cooldown: 90,
        iconUrl: '/assets/spells/petrify.png'
    },
    purify: {
        id: 'purify',
        name: 'Purify',
        description: 'Immediately removes all negative effects (except Suppression) and grants Control Immunity and 15% Movement Speed for 1.2s.',
        cooldown: 90,
        iconUrl: '/assets/spells/purify.png'
    },
    flameshot: {
        id: 'flameshot',
        name: 'Flameshot',
        description: 'Fires a flaming shot that deals Magic Damage scaling with distance (up to 200 (+50% Magic Power) to 600 (+150% Magic Power)). Knocks back nearby enemies.',
        cooldown: 50,
        iconUrl: '/assets/spells/flameshot.png'
    },
    flicker: {
        id: 'flicker',
        name: 'Flicker',
        description: 'Teleports a short distance in a specified direction. Grants 5 (+1 * Hero Level) extra Physical and Magic Defense for 1s after teleporting.',
        cooldown: 120,
        iconUrl: '/assets/spells/flicker.png'
    },
    arrival: {
        id: 'arrival',
        name: 'Arrival',
        description: 'Teleports to an allied Turret or Minion over 3s, granting them invincibility. Upon arrival, gains Movement Speed and enhances the next Basic Attack.',
        cooldown: 75,
        iconUrl: '/assets/spells/arrival.png'
    },
    vengeance: {
        id: 'vengeance',
        name: 'Vengeance',
        description: 'For 3s, reflects 35% of damage taken as Magic Damage to the attacker. Also grants 35% Damage Reduction.',
        cooldown: 75,
        iconUrl: '/assets/spells/vengeance.png'
    },
    recall: {
        id: 'recall',
        name: 'Recall',
        description: 'After a 6s channel (interrupted by taking damage), teleports back to your base. Useful for quick restoring and repositioning without wasting gold on Town Portal.',
        cooldown: 180,
        iconUrl: '/assets/spells/recall.png'
    }
};

export const getSpellById = (id: string): Spell | undefined => SPELLS[id];
export const getAllSpells = (): Spell[] => Object.values(SPELLS);
