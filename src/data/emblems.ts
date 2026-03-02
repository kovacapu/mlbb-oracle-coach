export interface Talent {
    id: string;
    name: string;
    description: string;
    iconUrl?: string;
}

export interface Emblem {
    id: string;
    name: string;
    roleFocus: string[];
    tier1Talents: Talent[];
    tier2Talents: Talent[];
    coreTalents: Talent[];
    iconUrl: string;
}

// Ortak Paylaşılan Yetenekler
const TIER_1_TALENTS: Record<string, Talent> = {
    thrill: { id: 'thrill', name: 'Heyecan', description: '16 Uyarlanabilir Saldırı kazanır.' },
    swift: { id: 'swift', name: 'Hız', description: '%10 ekstra Saldırı Hızı kazanır.' },
    inspire: { id: 'inspire', name: 'İlham', description: '%5 ekstra Bekleme Süresi Azaltımı kazanır.' },
    rupture: { id: 'rupture', name: 'Yarılma', description: '5 Uyarlanabilir Delme kazanır.' },
    vitality: { id: 'vitality', name: 'Canlılık', description: '225 Maks. Can kazanır.' },
    firmness: { id: 'firmness', name: 'Kararlılık', description: '6 ekstra Fiziksel ve Büyü Savunması kazanır.' },
    agility: { id: 'agility', name: 'Çeviklik', description: '%4 ekstra Hareket Hızı kazanır.' },
    fatal: { id: 'fatal', name: 'Öldürücü', description: '%5 ekstra Kritik Şans ve %10 Kritik Hasar kazanır.' }
};

const TIER_2_TALENTS: Record<string, Talent> = {
    bargain_hunter: { id: 'bargain_hunter', name: 'Fırsatçı', description: 'Ekipmanlar orijinal maliyetinin %95\'ine satın alınır.' },
    festival_of_blood: { id: 'festival_of_blood', name: 'Kan Festivali', description: '%6 Büyü Vampiri kazanır. Her kahraman öldürme veya yardımda %0.5 ekstra Büyü Vampiri kazanır (maks. 8 yığın).' },
    master_assassin: { id: 'master_assassin', name: 'Suikast Ustası', description: 'Yalnız düşman kahramanlara verilen hasar %7 artar.' },
    weapons_master: { id: 'weapons_master', name: 'Silah Ustası', description: 'Ekipman, amblem, yetenek ve becerilerden kazanılan Fiziksel Saldırı ve Büyü Gücü %5 artar.' },
    tenacity: { id: 'tenacity', name: 'Azim', description: 'Can %50\'nin altına düştüğünde Fiziksel ve Büyü Savunması 15 artar.' },
    wilderness_blessing: { id: 'wilderness_blessing', name: 'Vahşi Bereket', description: 'Ormanlık ve Irmak bölgelerindeki Hareket Hızı %10 artar.' },
    pull_yourself_together: { id: 'pull_yourself_together', name: 'Toparlan', description: 'Canlanma süresi ve Savaş Büyüsü bekleme süresi %15 azalır.' },
    seasoned_hunter: { id: 'seasoned_hunter', name: 'Deneyimli Avcı', description: 'Lord ve Kaplumbağa\'ya verilen hasar %15 artar.' }
};

export const EMBLEMS: Record<string, Emblem> = {
    assassin: {
        id: 'assassin',
        name: 'Suikastçı Amblemi',
        roleFocus: ['Assassin', 'Marksman', 'Fighter'],
        iconUrl: '/assets/emblems/assassin.png',
        tier1Talents: [TIER_1_TALENTS.rupture, TIER_1_TALENTS.thrill, TIER_1_TALENTS.agility],
        tier2Talents: [TIER_2_TALENTS.master_assassin, TIER_2_TALENTS.seasoned_hunter, TIER_2_TALENTS.weapons_master],
        coreTalents: [
            {
                id: 'lethal_ignition',
                name: 'Ölümcül Ateşleme',
                description: '4 farklı beceri/temel saldırı isabetinden sonra 125 + %40 Uyarlanabilir Saldırı tutarında yanma hasarı verir (Bekleme: 10 sn).'
            },
            {
                id: 'killing_spree',
                name: 'Ölüm Serisi',
                description: 'Düşman kahraman öldürünce Maks. Can\'ın %15\'i yenilenir ve 20% Hareket Hızı kazanılır.'
            },
            {
                id: 'quantum_charge',
                name: 'Kuantum Şarjı',
                description: 'Temel saldırılar %30 Hareket Hızı ve Can yenilenmesi sağlar. Bekleme: 8 sn.'
            }
        ]
    },
    mage: {
        id: 'mage',
        name: 'Büyücü Amblemi',
        roleFocus: ['Mage', 'Support', 'Assassin'],
        iconUrl: '/assets/emblems/mage.png',
        tier1Talents: [TIER_1_TALENTS.inspire, TIER_1_TALENTS.rupture, TIER_1_TALENTS.agility],
        tier2Talents: [TIER_2_TALENTS.bargain_hunter, TIER_2_TALENTS.weapons_master, TIER_2_TALENTS.wilderness_blessing],
        coreTalents: [
            {
                id: 'lethal_ignition',
                name: 'Ölümcül Ateşleme',
                description: '4 farklı beceri/temel saldırı isabetinden sonra 125 + %40 Uyarlanabilir Saldırı tutarında yanma hasarı verir (Bekleme: 10 sn).'
            },
            {
                id: 'impure_rage',
                name: 'Pis Öfke',
                description: 'Büyü isabetinde 50 + Maks. Can\'ın %5\'i oranında ekstra hasar ve Maks. Mana\'nın %2\'si oranında yenileme sağlar.'
            }
        ]
    },
    fighter: {
        id: 'fighter',
        name: 'Savaşçı Amblemi',
        roleFocus: ['Fighter', 'Tank'],
        iconUrl: '/assets/emblems/fighter.png',
        tier1Talents: [TIER_1_TALENTS.thrill, TIER_1_TALENTS.firmness, TIER_1_TALENTS.vitality],
        tier2Talents: [TIER_2_TALENTS.festival_of_blood, TIER_2_TALENTS.tenacity, TIER_2_TALENTS.seasoned_hunter],
        coreTalents: [
            {
                id: 'brave_smite',
                name: 'Cesur Çarpı',
                description: 'Beceri hasarı Maks. Can\'ın %4\'ünü yeniler (Bekleme: 6 sn).'
            },
            {
                id: 'war_cry',
                name: 'Savaş Çığlığı',
                description: '3 kez hasar verdikten sonra 3 sn boyunca %8 daha fazla hasar verir.'
            },
            {
                id: 'festival_of_blood',
                name: 'Kan Festivali',
                description: 'Büyü Vampirini artırır. Her savaşçı saldırısı sonrası sürekli yığın biriktirir.'
            }
        ]
    },
    marksman: {
        id: 'marksman',
        name: 'Nişancı Amblemi',
        roleFocus: ['Marksman'],
        iconUrl: '/assets/emblems/marksman.png',
        tier1Talents: [TIER_1_TALENTS.swift, TIER_1_TALENTS.fatal, TIER_1_TALENTS.agility],
        tier2Talents: [TIER_2_TALENTS.weapons_master, TIER_2_TALENTS.bargain_hunter, TIER_2_TALENTS.tenacity],
        coreTalents: [
            {
                id: 'weakness_finder',
                name: 'Zayıflık Avcısı',
                description: 'Temel saldırıların %20 ihtimalle düşmanın Hareket Hızını %90 ve Saldırı Hızını %50 azaltır.'
            },
            {
                id: 'quantum_charge',
                name: 'Kuantum Şarjı',
                description: 'Temel saldırılar %30 Hareket Hızı ve Can yenilenmesi sağlar. Bekleme: 8 sn.'
            }
        ]
    },
    tank: {
        id: 'tank',
        name: 'Tank Amblemi',
        roleFocus: ['Tank', 'Support', 'Fighter'],
        iconUrl: '/assets/emblems/tank.png',
        tier1Talents: [TIER_1_TALENTS.vitality, TIER_1_TALENTS.firmness, TIER_1_TALENTS.inspire],
        tier2Talents: [TIER_2_TALENTS.tenacity, TIER_2_TALENTS.pull_yourself_together, TIER_2_TALENTS.wilderness_blessing],
        coreTalents: [
            {
                id: 'concussive_blast',
                name: 'Sarsıcı Patlama',
                description: 'Temel saldırılar sonrası AoE Büyü Hasarı verir: 100 + Toplam Can\'ın %7\'si (Bekleme: 8 sn).'
            },
            {
                id: 'brave_smite',
                name: 'Cesur Çarpı',
                description: 'Beceri hasarı Maks. Can\'ın %4\'ünü yeniler (Bekleme: 6 sn).'
            }
        ]
    },
    support: {
        id: 'support',
        name: 'Destek Amblemi',
        roleFocus: ['Support', 'Mage', 'Tank'],
        iconUrl: '/assets/emblems/support.png',
        tier1Talents: [TIER_1_TALENTS.inspire, TIER_1_TALENTS.agility, TIER_1_TALENTS.vitality],
        tier2Talents: [TIER_2_TALENTS.pull_yourself_together, TIER_2_TALENTS.bargain_hunter, TIER_2_TALENTS.tenacity],
        coreTalents: [
            {
                id: 'focusing_mark',
                name: 'Odak Nişanı',
                description: 'İşaretlenen düşmana müttefiklerin 3 sn boyunca %6 fazla hasar vermesini sağlar.'
            },
            {
                id: 'quantum_charge',
                name: 'Kuantum Şarjı',
                description: 'Temel saldırılar %30 Hareket Hızı ve Can yenilenmesi sağlar. Bekleme: 8 sn.'
            }
        ]
    },
    common: {
        id: 'common',
        name: 'Ortak Amblem',
        roleFocus: ['Fighter', 'Assassin', 'Mage', 'Marksman', 'Tank', 'Support'],
        iconUrl: '/assets/emblems/common.png',
        tier1Talents: [TIER_1_TALENTS.thrill, TIER_1_TALENTS.swift, TIER_1_TALENTS.vitality, TIER_1_TALENTS.agility],
        tier2Talents: [TIER_2_TALENTS.wilderness_blessing, TIER_2_TALENTS.seasoned_hunter, TIER_2_TALENTS.bargain_hunter, TIER_2_TALENTS.pull_yourself_together],
        coreTalents: [
            {
                id: 'impure_rage',
                name: 'Pis Öfke',
                description: 'Büyü isabetinde 50 + Maks. Can\'ın %5\'i oranında ekstra hasar ve Maks. Mana\'nın %2\'si oranında yenileme sağlar.'
            },
            {
                id: 'quantum_charge',
                name: 'Kuantum Şarjı',
                description: 'Temel saldırılar %30 Hareket Hızı ve Can yenilenmesi sağlar. Bekleme: 8 sn.'
            },
            {
                id: 'war_cry',
                name: 'Savaş Çığlığı',
                description: '3 kez hasar verdikten sonra 3 sn boyunca %8 daha fazla hasar verir.'
            },
            {
                id: 'temporal_reign',
                name: 'Zamansal Hükümdarlık',
                description: 'Düşman kahramana hasar vererek 1,5 sn boyunca %30 yavaşlatır (Bekleme: 6 sn).'
            }
        ]
    }
};

export const getEmblemById = (id: string): Emblem | undefined => EMBLEMS[id];
export const getAllEmblems = (): Emblem[] => Object.values(EMBLEMS);
