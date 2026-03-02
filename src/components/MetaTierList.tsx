import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HEROES } from '../data/heroes';
import type { HeroRole } from '../data/heroes';
import { ImageWithFallback } from './ImageWithFallback';
import { Sword, Zap, Crosshair, Activity, Shield, Users, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TIERS = ['S+', 'S', 'A', 'B', 'C'] as const;
type Tier = typeof TIERS[number];

const TIER_CONFIG: Record<Tier, { label: string; labelColor: string; rowBg: string; border: string; cardBorder: string; glow: string }> = {
    'S+': {
        label: 'S+',
        labelColor: 'text-mlbb-gold',
        rowBg: 'bg-mlbb-gold/[0.04]',
        border: 'border-mlbb-gold/30',
        cardBorder: 'border-mlbb-gold/50',
        glow: 'shadow-[0_0_15px_rgba(255,191,0,0.2)]',
    },
    'S': {
        label: 'S',
        labelColor: 'text-orange-400',
        rowBg: 'bg-orange-500/[0.04]',
        border: 'border-orange-500/20',
        cardBorder: 'border-orange-500/40',
        glow: '',
    },
    'A': {
        label: 'A',
        labelColor: 'text-mlbb-purpleLight',
        rowBg: 'bg-mlbb-purple/[0.04]',
        border: 'border-mlbb-purple/20',
        cardBorder: 'border-mlbb-purple/40',
        glow: '',
    },
    'B': {
        label: 'B',
        labelColor: 'text-mlbb-neonBlue',
        rowBg: 'bg-mlbb-neonBlue/[0.03]',
        border: 'border-mlbb-neonBlue/15',
        cardBorder: 'border-mlbb-neonBlue/30',
        glow: '',
    },
    'C': {
        label: 'C',
        labelColor: 'text-gray-500',
        rowBg: 'bg-transparent',
        border: 'border-white/[0.04]',
        cardBorder: 'border-white/10',
        glow: '',
    },
};

const ROLES: { name: HeroRole; icon: React.ReactNode }[] = [
    { name: 'Fighter', icon: <Sword className="w-3.5 h-3.5" /> },
    { name: 'Mage', icon: <Zap className="w-3.5 h-3.5" /> },
    { name: 'Marksman', icon: <Crosshair className="w-3.5 h-3.5" /> },
    { name: 'Assassin', icon: <Activity className="w-3.5 h-3.5" /> },
    { name: 'Tank', icon: <Shield className="w-3.5 h-3.5" /> },
    { name: 'Support', icon: <Users className="w-3.5 h-3.5" /> },
];

export const MetaTierList: React.FC = () => {
    const { t } = useTranslation();
    const [selectedRole, setSelectedRole] = useState<HeroRole | 'All'>('All');

    const heroesByTier = useMemo(() => {
        const grouped: Record<Tier, typeof HEROES[string][]> = { 'S+': [], 'S': [], 'A': [], 'B': [], 'C': [] };
        Object.values(HEROES).forEach(hero => {
            if (selectedRole !== 'All' && !hero.roles.includes(selectedRole)) return;
            const tier = hero.metaTier || 'B';
            if (grouped[tier]) grouped[tier].push(hero);
        });
        Object.keys(grouped).forEach(key => {
            grouped[key as Tier].sort((a, b) => a.name.localeCompare(b.name));
        });
        return grouped;
    }, [selectedRole]);

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6 pb-12">

            {/* Header */}
            <div className="text-center space-y-3">
                <p className="section-label">GÜNCEL META — SEZON 30</p>
                <h1 className="font-display font-black text-4xl sm:text-5xl gradient-text-cyber tracking-wider flex items-center justify-center gap-3">
                    <Flame className="w-9 h-9 text-mlbb-gold" />
                    META TİER LİSTESİ
                </h1>
                <p className="text-gray-600 text-sm font-mono max-w-xl mx-auto">
                    Şafak Vadisi'nin güncel güç sıralaması. S+ tier metayı domine eder.
                </p>
            </div>

            {/* Role Filter */}
            <div className="card-glass rounded-2xl p-3 flex flex-wrap gap-2 justify-center">
                <button
                    onClick={() => setSelectedRole('All')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-widest transition-all ${selectedRole === 'All'
                        ? 'bg-mlbb-neonBlue/20 text-mlbb-neonBlue border border-mlbb-neonBlue/40'
                        : 'text-gray-600 hover:text-gray-300 border border-transparent hover:border-white/10'
                    }`}
                >
                    {t('all_roles')}
                </button>
                {ROLES.map(({ name, icon }) => (
                    <button
                        key={name}
                        onClick={() => setSelectedRole(name)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-widest transition-all ${selectedRole === name
                            ? 'bg-mlbb-gold/20 text-mlbb-gold border border-mlbb-gold/40'
                            : 'text-gray-600 hover:text-gray-300 border border-transparent hover:border-white/10'
                        }`}
                    >
                        {icon} {t(`role_${name}`)}
                    </button>
                ))}
            </div>

            {/* Tier Rows */}
            <div className="space-y-2">
                {TIERS.map(tier => {
                    const cfg = TIER_CONFIG[tier];
                    return (
                        <div
                            key={tier}
                            className={`flex flex-col md:flex-row rounded-2xl border overflow-hidden ${cfg.rowBg} ${cfg.border} ${cfg.glow} transition-all`}
                        >
                            {/* Tier Label */}
                            <div className={`w-full md:w-20 flex-shrink-0 flex items-center justify-center py-4 md:py-6 border-b md:border-b-0 md:border-r border-black/30`}>
                                <span className={`font-display font-black text-4xl md:text-5xl ${cfg.labelColor}`}>
                                    {tier}
                                </span>
                            </div>

                            {/* Heroes */}
                            <div className="flex-1 p-3 flex flex-wrap gap-2 items-center min-h-[80px]">
                                <AnimatePresence>
                                    {heroesByTier[tier].map(hero => (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            transition={{ duration: 0.2 }}
                                            key={hero.id}
                                            title={hero.name}
                                            className={`group relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-pointer hover:scale-110 hover:z-10 ${cfg.cardBorder}`}
                                        >
                                            <ImageWithFallback
                                                src={hero.imagePath}
                                                alt={hero.name}
                                                className="w-full h-full object-cover"
                                                fallbackText={hero.name.substring(0, 2)}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-1">
                                                <span className="text-[9px] font-bold text-white truncate px-1 text-center w-full">{hero.name}</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {heroesByTier[tier].length === 0 && (
                                    <div className="w-full text-center text-gray-700 text-xs font-mono py-4 uppercase tracking-widest">
                                        Bu seviyede kahraman yok
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
