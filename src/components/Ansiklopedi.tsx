import React, { useState, useMemo } from 'react';
import { ITEMS } from '../data/items';
import type { ItemCategory } from '../data/items';
import { EMBLEMS } from '../data/emblems';
import { ImageWithFallback } from './ImageWithFallback';
import { motion } from 'framer-motion';
import { Search, Library } from 'lucide-react';

type Tab = 'items' | 'emblems';

const CATEGORY_LABELS: Record<string, string> = {
    Attack: 'Saldırı',
    Magic: 'Büyü',
    Defense: 'Savunma',
    Movement: 'Hareket',
    Roam: 'Dolaşma',
    Jungle: 'Orman',
};

const CATEGORY_COLORS: Record<string, string> = {
    Attack: 'text-mlbb-danger border-mlbb-danger/40 bg-mlbb-danger/10',
    Magic: 'text-purple-400 border-purple-400/40 bg-purple-400/10',
    Defense: 'text-mlbb-neonBlue border-mlbb-neonBlue/40 bg-mlbb-neonBlue/10',
    Movement: 'text-mlbb-gold border-mlbb-gold/40 bg-mlbb-gold/10',
    Roam: 'text-mlbb-success border-mlbb-success/40 bg-mlbb-success/10',
    Jungle: 'text-orange-400 border-orange-400/40 bg-orange-400/10',
};

const STAT_LABELS: Record<string, string> = {
    physicalAttack: 'Fiz. Saldırı',
    magicPower: 'Büyü Gücü',
    hp: 'Can',
    mana: 'Mana',
    physicalDefense: 'Fiz. Savunma',
    magicDefense: 'Büyü Savunması',
    movementSpeed: 'Hız',
    attackSpeed: 'Saldırı Hızı',
    critChance: 'Krit. Şans',
    cdr: 'Bekleme Azaltımı',
    lifesteal: 'Can Çalma',
    spellVamp: 'Büyü Vampiri',
    manaRegen: 'Mana Yenileme',
    hpRegen: 'Can Yenileme',
    magicPenetration: 'Büyü Delme',
    physicalPenetration: 'Fiz. Delme',
};

const ALL_CATEGORIES: (ItemCategory | 'All')[] = ['All', 'Attack', 'Magic', 'Defense', 'Movement', 'Jungle', 'Roam'];

export const Ansiklopedi: React.FC = () => {
    const [tab, setTab] = useState<Tab>('items');
    const [search, setSearch] = useState('');
    const [filterCat, setFilterCat] = useState<ItemCategory | 'All'>('All');

    const filteredItems = useMemo(() => {
        const q = search.toLowerCase();
        return Object.values(ITEMS).filter(item => {
            if (filterCat !== 'All' && item.category !== filterCat) return false;
            if (q && !item.name.toLowerCase().includes(q)) return false;
            return true;
        });
    }, [filterCat, search]);

    const filteredEmblems = useMemo(() => {
        const q = search.toLowerCase();
        return Object.values(EMBLEMS).filter(e =>
            !q || e.name.toLowerCase().includes(q)
        );
    }, [search]);

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-12">

            {/* Header */}
            <div className="text-center space-y-2">
                <p className="section-label">OYUN BİLGİSİ</p>
                <h1 className="font-display font-black text-4xl gradient-text-cyber tracking-wider uppercase flex items-center justify-center gap-3">
                    <Library className="w-9 h-9 text-mlbb-neonBlue" />
                    ANSİKLOPEDİ
                </h1>
                <p className="text-gray-600 font-mono text-sm">Eşya ve amblem veritabanı</p>
            </div>

            {/* Tab + Search Row */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex gap-1 bg-black/50 p-1 rounded-xl border border-white/[0.06] shrink-0">
                    <button
                        onClick={() => { setTab('items'); setSearch(''); setFilterCat('All'); }}
                        className={`px-5 py-2 rounded-lg text-xs font-bold font-mono uppercase tracking-wider transition-all ${
                            tab === 'items'
                                ? 'bg-mlbb-neonBlue/20 text-mlbb-neonBlue'
                                : 'text-gray-600 hover:text-gray-300'
                        }`}
                    >
                        Eşyalar
                    </button>
                    <button
                        onClick={() => { setTab('emblems'); setSearch(''); setFilterCat('All'); }}
                        className={`px-5 py-2 rounded-lg text-xs font-bold font-mono uppercase tracking-wider transition-all ${
                            tab === 'emblems'
                                ? 'bg-mlbb-gold/20 text-mlbb-gold'
                                : 'text-gray-600 hover:text-gray-300'
                        }`}
                    >
                        Amblemler
                    </button>
                </div>

                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder={tab === 'items' ? 'Eşya ara...' : 'Amblem ara...'}
                        className="input-cyber w-full pl-9 py-2 text-sm"
                    />
                </div>
            </div>

            {/* ===== ITEMS TAB ===== */}
            {tab === 'items' && (
                <>
                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-2">
                        {ALL_CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilterCat(cat)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider border transition-all ${
                                    filterCat === cat
                                        ? 'bg-mlbb-neonBlue/20 text-mlbb-neonBlue border-mlbb-neonBlue/40'
                                        : 'text-gray-600 border-white/[0.06] hover:text-gray-300 hover:border-white/20'
                                }`}
                            >
                                {cat === 'All' ? 'Tümü' : CATEGORY_LABELS[cat] ?? cat}
                            </button>
                        ))}
                        <span className="ml-auto self-center text-xs font-mono text-gray-700">
                            {filteredItems.length} eşya
                        </span>
                    </div>

                    {/* Items Grid */}
                    {filteredItems.length === 0 ? (
                        <div className="text-center py-20 text-gray-600 font-mono text-sm uppercase tracking-widest">
                            Eşya bulunamadı
                        </div>
                    ) : (
                        <motion.div
                            key={`${filterCat}-${search}`}
                            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.03 } } }}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
                        >
                            {filteredItems.map(item => (
                                <motion.div
                                    key={item.id}
                                    variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }}
                                    className="card-glass rounded-xl border border-white/[0.06] hover:border-mlbb-neonBlue/20 p-3 flex flex-col gap-2 transition-colors group"
                                >
                                    {/* Icon + Name */}
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 shrink-0 group-hover:border-mlbb-neonBlue/30 transition-colors">
                                            <ImageWithFallback
                                                src={item.iconUrl}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                                fallbackText={item.name.substring(0, 2)}
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-display font-bold text-xs text-white leading-tight">{item.name}</p>
                                            <span className={`inline-block mt-0.5 text-[8px] font-mono font-bold border rounded px-1 py-px ${CATEGORY_COLORS[item.category] ?? 'text-gray-500 border-gray-500/40 bg-transparent'}`}>
                                                {CATEGORY_LABELS[item.category] ?? item.category}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Base Stats */}
                                    {Object.keys(item.baseStats).length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {Object.entries(item.baseStats).map(([k, v]) => (
                                                <span key={k} className="text-[9px] font-mono text-gray-500 bg-black/30 rounded px-1.5 py-px">
                                                    {STAT_LABELS[k] ?? k} {v}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Passive Tags */}
                                    {item.passiveTags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-auto pt-1">
                                            {item.passiveTags.map(tag => (
                                                <span key={tag} className="text-[8px] font-mono text-mlbb-neonBlue/70 bg-mlbb-neonBlue/5 border border-mlbb-neonBlue/10 rounded px-1 py-px">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </>
            )}

            {/* ===== EMBLEMS TAB ===== */}
            {tab === 'emblems' && (
                <>
                    <span className="text-xs font-mono text-gray-700">{filteredEmblems.length} amblem</span>

                    {filteredEmblems.length === 0 ? (
                        <div className="text-center py-20 text-gray-600 font-mono text-sm uppercase tracking-widest">
                            Amblem bulunamadı
                        </div>
                    ) : (
                        <motion.div
                            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } }}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                            {filteredEmblems.map(emblem => (
                                <motion.div
                                    key={emblem.id}
                                    variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                                    className="card-glass rounded-2xl border border-white/[0.06] hover:border-mlbb-gold/20 overflow-hidden transition-colors"
                                >
                                    {/* Emblem Header */}
                                    <div className="flex items-center gap-3 p-4 border-b border-white/[0.06] bg-black/20">
                                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 shrink-0">
                                            <ImageWithFallback
                                                src={emblem.iconUrl}
                                                alt={emblem.name}
                                                className="w-full h-full object-cover"
                                                fallbackText={emblem.name.substring(0, 2)}
                                            />
                                        </div>
                                        <div>
                                            <p className="font-display font-bold text-white text-base">{emblem.name}</p>
                                            <div className="flex flex-wrap gap-1 mt-0.5">
                                                {emblem.roleFocus.map(r => (
                                                    <span key={r} className="text-[9px] font-mono text-mlbb-gold/80 bg-mlbb-gold/5 border border-mlbb-gold/20 rounded px-1.5 py-px uppercase">
                                                        {r}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 space-y-4">
                                        {/* Tier 1 Talents */}
                                        <div>
                                            <p className="text-[9px] font-mono text-gray-700 uppercase tracking-widest mb-2">1. Kademe Yetenekleri</p>
                                            <div className="space-y-1.5">
                                                {emblem.tier1Talents.map(talent => (
                                                    <div key={talent.id} className="rounded-lg bg-black/30 border border-mlbb-neonBlue/10 px-3 py-2">
                                                        <p className="text-xs font-display font-bold text-mlbb-neonBlue mb-0.5">{talent.name}</p>
                                                        <p className="text-[10px] font-mono text-gray-500 leading-relaxed">{talent.description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Tier 2 Talents */}
                                        <div>
                                            <p className="text-[9px] font-mono text-gray-700 uppercase tracking-widest mb-2">2. Kademe Yetenekleri</p>
                                            <div className="space-y-1.5">
                                                {emblem.tier2Talents.map(talent => (
                                                    <div key={talent.id} className="rounded-lg bg-black/30 border border-purple-500/10 px-3 py-2">
                                                        <p className="text-xs font-display font-bold text-purple-400 mb-0.5">{talent.name}</p>
                                                        <p className="text-[10px] font-mono text-gray-500 leading-relaxed">{talent.description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Core Talents */}
                                        <div>
                                            <p className="text-[9px] font-mono text-gray-700 uppercase tracking-widest mb-2">Ana Yetenek — 1 seç</p>
                                            <div className="space-y-2">
                                                {emblem.coreTalents.map(talent => (
                                                    <div key={talent.id} className="rounded-xl bg-black/30 border border-mlbb-gold/10 p-3">
                                                        <p className="text-xs font-display font-bold text-mlbb-gold mb-1">{talent.name}</p>
                                                        <p className="text-[10px] font-mono text-gray-500 leading-relaxed">{talent.description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </>
            )}
        </div>
    );
};
