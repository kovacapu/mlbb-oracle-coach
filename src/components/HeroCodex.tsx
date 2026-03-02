import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Shield, Sword, Zap, Crosshair, Users, Activity, ShieldAlert, BookmarkPlus, Loader2, Plus } from 'lucide-react';
import { HEROES } from '../data/heroes';
import type { HeroRole, Hero } from '../data/heroes';
import { ImageWithFallback } from './ImageWithFallback';
import { MLAnalyzer } from '../services/MLAnalyzer';
import { ITEMS, getAllItems } from '../data/items';
import { EMBLEMS, getAllEmblems, getEmblemById } from '../data/emblems';
import { SPELLS } from '../data/spells';
import { supabase } from '../lib/supabase';

interface HeroBuild {
    spellId: string;
    emblemId: string;
    tier1Id: string;
    tier2Id: string;
    coreId: string;
    items: string[];
}

const allItems = getAllItems();
const allEmblems = getAllEmblems();
const allSpells = Object.values(SPELLS);

const ROLES: { name: HeroRole; icon: React.ReactNode; color: string }[] = [
    { name: 'Fighter', icon: <Sword className="w-3.5 h-3.5" />, color: 'text-orange-400' },
    { name: 'Mage', icon: <Zap className="w-3.5 h-3.5" />, color: 'text-purple-400' },
    { name: 'Marksman', icon: <Crosshair className="w-3.5 h-3.5" />, color: 'text-blue-400' },
    { name: 'Assassin', icon: <Activity className="w-3.5 h-3.5" />, color: 'text-red-400' },
    { name: 'Tank', icon: <Shield className="w-3.5 h-3.5" />, color: 'text-cyan-400' },
    { name: 'Support', icon: <Users className="w-3.5 h-3.5" />, color: 'text-green-400' },
];

const TIER_STYLE: Record<string, string> = {
    'S+': 'tier-splus',
    'S':  'tier-s',
    'A':  'tier-a',
    'B':  'tier-b',
    'C':  'tier-c',
};

export const HeroCodex: React.FC = () => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState<HeroRole | 'All'>('All');
    const [selectedHero, setSelectedHero] = useState<Hero | null>(null);

    // ── Hero Build state ──
    const [heroBuilds, setHeroBuilds] = useState<Record<string, HeroBuild>>({});
    const [editItems, setEditItems] = useState<string[]>([]);
    const [editSpellId, setEditSpellId] = useState('');
    const [editEmblemId, setEditEmblemId] = useState('');
    const [editTier1Id, setEditTier1Id] = useState('');
    const [editTier2Id, setEditTier2Id] = useState('');
    const [editCoreId, setEditCoreId] = useState('');
    const [isItemPickerOpen, setIsItemPickerOpen] = useState(false);
    const [isSavingBuild, setIsSavingBuild] = useState(false);
    const [buildSavedFor, setBuildSavedFor] = useState('');

    // Fetch saved builds on mount
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session?.user) return;
            supabase.from('profiles').select('hero_builds').eq('user_id', session.user.id)
                .single().then(({ data }) => {
                    if (data?.hero_builds) setHeroBuilds(data.hero_builds);
                });
        });
    }, []);

    // Load saved build (or AI recommendation) into edit state when hero selected
    useEffect(() => {
        if (!selectedHero) return;
        setIsItemPickerOpen(false);
        const saved = heroBuilds[selectedHero.id];
        if (saved) {
            setEditItems(saved.items || []);
            setEditSpellId(saved.spellId || '');
            setEditEmblemId(saved.emblemId || '');
            setEditTier1Id(saved.tier1Id || '');
            setEditTier2Id(saved.tier2Id || '');
            setEditCoreId(saved.coreId || '');
        } else {
            // Pre-fill with AI recommendation
            const ai = MLAnalyzer.generateBuildRecommendation(selectedHero.id, [], t as (k: string, o?: unknown) => string);
            setEditItems(ai.coreItems || []);
            setEditSpellId(ai.recommendedSpell || '');
            setEditEmblemId(ai.recommendedEmblem?.id || '');
            setEditTier1Id('');
            setEditTier2Id('');
            setEditCoreId(ai.recommendedEmblem?.coreId || '');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedHero?.id]);

    const handleSaveBuild = async () => {
        if (!selectedHero) return;
        setIsSavingBuild(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return;
            const build: HeroBuild = {
                spellId: editSpellId, emblemId: editEmblemId,
                tier1Id: editTier1Id, tier2Id: editTier2Id,
                coreId: editCoreId, items: [...editItems],
            };
            const updated = { ...heroBuilds, [selectedHero.id]: build };
            const { error } = await supabase.from('profiles')
                .upsert({ user_id: session.user.id, hero_builds: updated }, { onConflict: 'user_id' });
            if (!error) {
                setHeroBuilds(updated);
                setBuildSavedFor(selectedHero.id);
                setTimeout(() => setBuildSavedFor(''), 3000);
            }
        } finally {
            setIsSavingBuild(false);
        }
    };

    const heroesList = useMemo(() => Object.values(HEROES), []);

    const filteredHeroes = useMemo(() =>
        heroesList.filter(h => {
            const matchesSearch = h.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = selectedRole === 'All' || h.roles.includes(selectedRole);
            return matchesSearch && matchesRole;
        }).sort((a, b) => a.name.localeCompare(b.name)),
        [heroesList, searchTerm, selectedRole]
    );

    const heroInsights = useMemo(() => {
        if (!selectedHero) return null;
        const draft = MLAnalyzer.generateBuildRecommendation(selectedHero.id, [], t as (k: string, o?: unknown) => string);
        return { coreItems: draft.coreItems, emblem: draft.recommendedEmblem, spellId: draft.recommendedSpell };
    }, [selectedHero, t]);

    return (
        <div className="w-full space-y-6 animate-fade-in">

            {/* Header */}
            <div className="mb-2">
                <p className="section-label mb-1">{t('heroes_title')}</p>
                <h1 className="font-display font-black text-3xl sm:text-4xl tracking-tight text-white">
                    Hero <span className="gradient-text-cyber">Codex</span>
                </h1>
                <p className="text-gray-500 text-sm mt-1">{t('heroes_desc')}</p>
            </div>

            {/* Filters */}
            <div className="card-glass rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-center">
                {/* Search */}
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <input
                        type="text"
                        placeholder={t('search_hero')}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="input-cyber pl-10"
                    />
                </div>

                {/* Role Chips */}
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setSelectedRole('All')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all font-display ${
                            selectedRole === 'All'
                                ? 'bg-gradient-to-r from-mlbb-neonBlue to-blue-600 text-black shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                                : 'bg-white/5 text-gray-500 hover:text-white border border-white/[0.08]'
                        }`}
                    >
                        {t('all_roles')}
                    </button>
                    {ROLES.map(({ name, icon, color }) => (
                        <button
                            key={name}
                            onClick={() => setSelectedRole(name)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all font-display ${
                                selectedRole === name
                                    ? `bg-white/10 border border-white/20 ${color}`
                                    : 'bg-white/5 text-gray-500 hover:text-white border border-white/[0.08]'
                            }`}
                        >
                            {icon}
                            {t(`role_${name}`)}
                        </button>
                    ))}
                </div>

                <span className="section-label ml-auto shrink-0">{filteredHeroes.length} kahraman</span>
            </div>

            {/* Hero Grid */}
            <motion.div layout className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
                <AnimatePresence>
                    {filteredHeroes.map(hero => (
                        <motion.div
                            layout
                            key={hero.id}
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.85 }}
                            transition={{ duration: 0.18 }}
                            onClick={() => setSelectedHero(hero)}
                            className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer border border-white/[0.06] hover:border-mlbb-neonBlue/50 transition-all duration-300 bg-black/40"
                        >
                            <ImageWithFallback
                                src={hero.imagePath} alt={hero.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                fallbackText={hero.name.substring(0, 2)}
                            />
                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

                            {/* Tier badge */}
                            {hero.metaTier && (
                                <div className={`absolute top-1.5 right-1.5 text-[9px] font-black px-1.5 py-0.5 rounded-md ${TIER_STYLE[hero.metaTier] ?? ''}`}>
                                    {hero.metaTier}
                                </div>
                            )}

                            {/* Name */}
                            <div className="absolute bottom-0 left-0 right-0 p-2">
                                <span className="text-white font-display font-bold text-[10px] leading-tight block truncate group-hover:text-mlbb-neonBlue transition-colors">
                                    {hero.name}
                                </span>
                            </div>

                            {/* Hover glow */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-mlbb-neonBlue/[0.06] rounded-xl" />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            {filteredHeroes.length === 0 && (
                <div className="card-glass rounded-2xl p-16 text-center">
                    <Sword className="w-12 h-12 mx-auto mb-3 text-gray-700" />
                    <p className="text-gray-500">{t('hero_not_found')}</p>
                </div>
            )}

            {/* Hero Detail Modal */}
            <AnimatePresence>
                {selectedHero && heroInsights && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={e => { if (e.target === e.currentTarget) setSelectedHero(null); }}
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
                    >
                        <motion.div
                            initial={{ scale: 0.94, y: 24 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.94, y: 24 }}
                            className="card-glass rounded-2xl max-w-4xl w-full overflow-hidden flex flex-col md:flex-row relative my-8"
                        >
                            <button
                                onClick={() => setSelectedHero(null)}
                                className="absolute top-4 right-4 z-20 w-8 h-8 bg-black/60 hover:bg-mlbb-danger/60 rounded-full flex items-center justify-center text-white transition-colors border border-white/10"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            {/* Left — Portrait */}
                            <div className="w-full md:w-2/5 relative min-h-[280px]">
                                <ImageWithFallback
                                    src={selectedHero.imagePath} alt={selectedHero.name}
                                    className="absolute inset-0 w-full h-full object-cover"
                                    fallbackText={selectedHero.name}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-black/60" />

                                <div className="absolute bottom-5 left-5 z-10">
                                    {selectedHero.metaTier && (
                                        <div className={`inline-block text-xs font-black px-2 py-1 rounded-lg mb-2 ${TIER_STYLE[selectedHero.metaTier] ?? ''}`}>
                                            {selectedHero.metaTier} Tier
                                        </div>
                                    )}
                                    <h2 className="text-3xl font-display font-black text-white drop-shadow-lg">{selectedHero.name}</h2>
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {selectedHero.roles.map(r => {
                                            const roleInfo = ROLES.find(ro => ro.name === r);
                                            return (
                                                <span key={r} className={`flex items-center gap-1 px-2 py-0.5 bg-black/50 backdrop-blur border border-white/10 rounded-md text-xs font-bold ${roleInfo?.color ?? 'text-white'}`}>
                                                    {roleInfo?.icon}
                                                    {t(`role_${r}`)}
                                                </span>
                                            );
                                        })}
                                        <span className={`px-2 py-0.5 bg-black/50 backdrop-blur border border-white/10 rounded-md text-xs font-bold ${
                                            selectedHero.damageType === 'Magic' ? 'text-purple-400' :
                                            selectedHero.damageType === 'Physical' ? 'text-orange-400' : 'text-gray-300'
                                        }`}>
                                            {selectedHero.damageType}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Right — Insights */}
                            <div className="w-full md:w-3/5 p-6 space-y-6 overflow-y-auto max-h-[80vh] md:max-h-none">

                                {/* Core Build */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Zap className="w-4 h-4 text-mlbb-neonBlue" />
                                        <h3 className="font-display font-bold text-sm tracking-widest uppercase text-white">{t('codex_core_build')}</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {heroInsights.coreItems.map((itemId: string, idx: number) => {
                                            const item = ITEMS[itemId];
                                            if (!item) return null;
                                            return (
                                                <div key={idx} className="flex flex-col items-center gap-1 group">
                                                    <div className="w-12 h-12 rounded-xl border border-white/10 overflow-hidden bg-black/40 group-hover:border-mlbb-neonBlue/50 transition-all">
                                                        <ImageWithFallback src={item.iconUrl} alt={item.name} className="w-full h-full object-cover" fallbackText="IT" />
                                                    </div>
                                                    <span className="text-[9px] text-gray-500 text-center w-12 leading-tight truncate">{item.name}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Spell + Emblem */}
                                <div className="grid grid-cols-2 gap-3">
                                    {/* Spell */}
                                    {heroInsights.spellId && (() => {
                                        const spell = SPELLS[heroInsights.spellId];
                                        if (!spell) return null;
                                        return (
                                            <div className="bg-mlbb-neonBlue/[0.05] border border-mlbb-neonBlue/15 rounded-xl p-3 flex gap-3 items-start">
                                                <div className="w-10 h-10 rounded-lg border border-mlbb-neonBlue/30 overflow-hidden shrink-0 bg-black/40">
                                                    <ImageWithFallback src={spell.iconUrl} alt={spell.name} className="w-full h-full object-cover" fallbackText="SP" />
                                                </div>
                                                <div>
                                                    <p className="section-label mb-0.5">Büyü</p>
                                                    <p className="text-white font-bold text-sm">{spell.name}</p>
                                                    <p className="text-gray-600 text-[10px] leading-tight line-clamp-2 mt-0.5">{spell.description}</p>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* Emblem */}
                                    {heroInsights.emblem && (() => {
                                        const embTree = heroInsights.emblem;
                                        const emb = EMBLEMS[embTree.id];
                                        if (!emb) return null;
                                        const core = emb.coreTalents?.find(t => t.id === embTree.coreId);
                                        return (
                                            <div className="bg-mlbb-gold/[0.05] border border-mlbb-gold/15 rounded-xl p-3 flex gap-3 items-start">
                                                <div className="w-10 h-10 rounded-full border border-mlbb-gold/30 overflow-hidden shrink-0 bg-black/40">
                                                    <ImageWithFallback src={emb.iconUrl} alt={emb.name} className="w-full h-full object-cover" fallbackText="EM" />
                                                </div>
                                                <div>
                                                    <p className="section-label mb-0.5" style={{ color: 'rgba(255,191,0,0.6)' }}>Amblem</p>
                                                    <p className="text-white font-bold text-sm">{emb.name}</p>
                                                    {core && <p className="text-mlbb-gold text-[10px] mt-0.5">{core.name}</p>}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>

                                {/* Matchups */}
                                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/[0.06]">
                                    {[
                                        { label: 'Sinerjiler', heroes: selectedHero.synergies, color: 'border-mlbb-neonBlue/50', icon: <Users className="w-3.5 h-3.5 text-mlbb-neonBlue" /> },
                                        { label: 'Ezdiği', heroes: selectedHero.strongAgainst, color: 'border-green-500/50', icon: <Sword className="w-3.5 h-3.5 text-green-400" /> },
                                        { label: 'Zayıf', heroes: selectedHero.weakAgainst, color: 'border-red-500/50', icon: <ShieldAlert className="w-3.5 h-3.5 text-red-400" /> },
                                    ].map(({ label, heroes: hList, color, icon }) => (
                                        <div key={label}>
                                            <div className="flex items-center gap-1 mb-2">
                                                {icon}
                                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{label}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {hList?.map(id => {
                                                    const h = HEROES[id];
                                                    if (!h) return null;
                                                    return (
                                                        <div key={id} className={`w-9 h-9 rounded-full border overflow-hidden ${color} hover:scale-110 transition-transform cursor-default`} title={h.name}>
                                                            <ImageWithFallback src={h.imagePath} alt={h.name} className="w-full h-full object-cover" fallbackText={h.name.substring(0, 2)} />
                                                        </div>
                                                    );
                                                }) ?? <span className="text-gray-700 text-xs italic">—</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2 pt-3 border-t border-white/[0.06]">
                                    {selectedHero.tags.map(tag => (
                                        <span key={tag} className="px-2.5 py-1 bg-white/[0.04] border border-white/[0.08] text-gray-400 rounded-lg text-xs font-mono">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                {/* ── VARSAYILAN YAPINIZ ── */}
                                <div className="pt-4 border-t border-white/[0.06] space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <BookmarkPlus className="w-4 h-4 text-mlbb-purple" />
                                            <h3 className="font-display font-bold text-sm tracking-widest uppercase text-white">Varsayılan Yapın</h3>
                                        </div>
                                        {heroBuilds[selectedHero.id] && (
                                            <span className="text-[10px] font-mono text-mlbb-purple/60">↺ Kayıtlı yapı</span>
                                        )}
                                    </div>

                                    {/* ─ Eşyalar ─ */}
                                    <div>
                                        <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-2">EŞYALAR (6 slot)</p>
                                        <div className="flex flex-wrap gap-2">
                                            {[...Array(6)].map((_, i) => {
                                                const itemId = editItems[i];
                                                const item = itemId ? ITEMS[itemId] : null;
                                                return (
                                                    <div key={i} className="w-12 h-12 relative group">
                                                        {item ? (
                                                            <div
                                                                onClick={() => setEditItems(prev => prev.filter((_, idx) => idx !== i))}
                                                                className="w-full h-full rounded-xl border border-mlbb-gold/30 overflow-hidden cursor-pointer hover:border-mlbb-danger/60 transition-all"
                                                                title={`${item.name} (kaldır)`}
                                                            >
                                                                <ImageWithFallback src={item.iconUrl} alt={item.name} className="w-full h-full object-cover" fallbackText="IT" />
                                                                <div className="absolute inset-0 bg-mlbb-danger/60 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <X className="w-4 h-4 text-white" />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() => setIsItemPickerOpen(true)}
                                                                className="w-full h-full rounded-xl border-2 border-dashed border-white/10 text-gray-700 hover:border-mlbb-neonBlue/40 hover:text-mlbb-neonBlue transition-all flex items-center justify-center"
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Item picker */}
                                        {isItemPickerOpen && editItems.length < 6 && (
                                            <div className="mt-2 rounded-xl border border-white/[0.06] bg-black/40 p-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="text-[10px] font-mono text-mlbb-neonBlue uppercase tracking-widest">Eşya Seç</p>
                                                    <button onClick={() => setIsItemPickerOpen(false)} className="text-gray-600 hover:text-white"><X className="w-3.5 h-3.5" /></button>
                                                </div>
                                                <div className="grid grid-cols-8 gap-1 max-h-32 overflow-y-auto">
                                                    {allItems.filter(it => !editItems.includes(it.id)).map(it => (
                                                        <div
                                                            key={it.id}
                                                            onClick={() => {
                                                                setEditItems(prev => [...prev, it.id]);
                                                                if (editItems.length >= 5) setIsItemPickerOpen(false);
                                                            }}
                                                            title={it.name}
                                                            className="aspect-square rounded-lg border border-white/[0.06] overflow-hidden cursor-pointer hover:border-mlbb-neonBlue/40 opacity-70 hover:opacity-100 transition-all"
                                                        >
                                                            <ImageWithFallback src={it.iconUrl} alt={it.name} className="w-full h-full object-cover" fallbackText="IT" />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* ─ Savaş Büyüsü ─ */}
                                    <div>
                                        <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-2">SAVAŞ BÜYÜSÜ</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {allSpells.map(sp => (
                                                <div
                                                    key={sp.id}
                                                    onClick={() => setEditSpellId(sp.id)}
                                                    title={sp.name}
                                                    className={`w-11 h-11 rounded-xl border overflow-hidden cursor-pointer transition-all ${editSpellId === sp.id ? 'border-mlbb-gold shadow-[0_0_8px_rgba(255,191,0,0.3)]' : 'border-white/[0.06] grayscale hover:grayscale-0 hover:border-white/20'}`}
                                                >
                                                    <ImageWithFallback src={sp.iconUrl} alt={sp.name} className="w-full h-full object-cover" fallbackText="SP" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* ─ Amblem ─ */}
                                    <div>
                                        <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-2">AMBLEM</p>
                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                            {allEmblems.map(emb => (
                                                <div
                                                    key={emb.id}
                                                    onClick={() => { setEditEmblemId(emb.id); setEditTier1Id(''); setEditTier2Id(''); setEditCoreId(''); }}
                                                    title={emb.name}
                                                    className={`w-11 h-11 rounded-xl border-2 overflow-hidden cursor-pointer transition-all ${editEmblemId === emb.id ? 'border-mlbb-purple shadow-[0_0_8px_rgba(124,58,237,0.3)]' : 'border-white/[0.06] grayscale hover:grayscale-0 hover:border-mlbb-purple/30'}`}
                                                >
                                                    <ImageWithFallback src={emb.iconUrl} alt={emb.name} className="w-full h-full object-cover" fallbackText={emb.name.substring(0, 2)} />
                                                </div>
                                            ))}
                                        </div>

                                        {/* Tier talents */}
                                        {editEmblemId && (() => {
                                            const emb = getEmblemById(editEmblemId);
                                            if (!emb) return null;
                                            return (
                                                <div className="space-y-2">
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {emb.tier1Talents?.map(t => (
                                                            <button key={t.id} type="button" onClick={() => setEditTier1Id(t.id)}
                                                                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border transition-all ${editTier1Id === t.id ? 'bg-mlbb-neonBlue/20 border-mlbb-neonBlue/50 text-mlbb-neonBlue' : 'border-white/[0.08] text-gray-500 hover:text-gray-300 hover:border-white/20'}`}>
                                                                {t.name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {emb.tier2Talents?.map(t => (
                                                            <button key={t.id} type="button" onClick={() => setEditTier2Id(t.id)}
                                                                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border transition-all ${editTier2Id === t.id ? 'bg-purple-500/20 border-purple-500/50 text-purple-300' : 'border-white/[0.08] text-gray-500 hover:text-gray-300 hover:border-white/20'}`}>
                                                                {t.name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {emb.coreTalents?.map(t => (
                                                            <button key={t.id} type="button" onClick={() => setEditCoreId(t.id)}
                                                                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border transition-all ${editCoreId === t.id ? 'bg-mlbb-gold/20 border-mlbb-gold/50 text-mlbb-gold' : 'border-white/[0.08] text-gray-500 hover:text-gray-300 hover:border-white/20'}`}>
                                                                {t.name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    {/* ─ Kaydet ─ */}
                                    <button
                                        type="button"
                                        onClick={handleSaveBuild}
                                        disabled={isSavingBuild}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-mlbb-purple/40 text-mlbb-purple hover:bg-mlbb-purple/10 hover:border-mlbb-purple text-sm font-mono font-bold uppercase tracking-wider transition-all disabled:opacity-40"
                                    >
                                        {isSavingBuild
                                            ? <><Loader2 className="w-4 h-4 animate-spin" /> Kaydediliyor...</>
                                            : buildSavedFor === selectedHero.id
                                                ? <><BookmarkPlus className="w-4 h-4" /> Kaydedildi ✓</>
                                                : <><BookmarkPlus className="w-4 h-4" /> {selectedHero.name} Yapısını Kaydet</>
                                        }
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
