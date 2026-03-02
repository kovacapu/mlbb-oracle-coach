import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { getHeroById } from '../data/heroes';
import { BarChart2, Loader2, TrendingUp, Crosshair, Trophy } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';
import { motion } from 'framer-motion';
import type { MatchRecord } from '../types';

interface HeroStat {
    heroId: string;
    heroName: string;
    imagePath: string;
    roles: string[];
    matches: number;
    wins: number;
    losses: number;
    winRate: number;
    totalKills: number;
    totalDeaths: number;
    totalAssists: number;
    avgKda: number;
    lastPlayed: string;
}

type SortKey = 'matches' | 'winRate' | 'avgKda';

export const HeroStats: React.FC = () => {
    const { t } = useTranslation();
    const [allMatches, setAllMatches] = useState<MatchRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState<SortKey>('matches');

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session?.user) return;
                const { data, error } = await supabase
                    .from('matches')
                    .select('*')
                    .eq('user_id', session.user.id)
                    .order('created_at', { ascending: false });
                if (error) throw error;
                setAllMatches(data || []);
            } catch (err) {
                console.error('HeroStats fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const heroStats = useMemo<HeroStat[]>(() => {
        const map: Record<string, MatchRecord[]> = {};
        allMatches.forEach(m => {
            const hid = m.hero_id || m.heroId;
            if (!hid) return;
            if (!map[hid]) map[hid] = [];
            map[hid].push(m);
        });

        return Object.entries(map).map(([heroId, matches]) => {
            const hero = getHeroById(heroId);
            const wins = matches.filter(m => m.result === 'Victory').length;
            const totalK = matches.reduce((a, m) => a + m.kills, 0);
            const totalD = matches.reduce((a, m) => a + m.deaths, 0);
            const totalA = matches.reduce((a, m) => a + m.assists, 0);
            const avgKda = parseFloat(((totalK + totalA) / Math.max(totalD, 1)).toFixed(2));
            const lastPlayed = matches[0]?.created_at ?? '';

            return {
                heroId,
                heroName: hero?.name ?? heroId,
                imagePath: hero?.imagePath ?? '',
                roles: hero?.roles ?? [],
                matches: matches.length,
                wins,
                losses: matches.length - wins,
                winRate: Math.round((wins / matches.length) * 100),
                totalKills: totalK,
                totalDeaths: totalD,
                totalAssists: totalA,
                avgKda,
                lastPlayed,
            };
        });
    }, [allMatches]);

    const sorted = useMemo(() =>
        [...heroStats].sort((a, b) => b[sortBy] - a[sortBy]),
        [heroStats, sortBy]
    );

    if (loading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <div className="flex items-center gap-3 text-mlbb-neonBlue">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="font-mono text-sm tracking-widest uppercase">YÜKLENİYOR...</span>
                </div>
            </div>
        );
    }

    const SORT_OPTIONS: { key: SortKey; label: string; icon: React.ReactNode }[] = [
        { key: 'matches', label: 'EN ÇOK OYNANAN', icon: <Crosshair className="w-3.5 h-3.5" /> },
        { key: 'winRate', label: 'EN YÜKSEK WR', icon: <Trophy className="w-3.5 h-3.5" /> },
        { key: 'avgKda', label: 'EN İYİ KDA', icon: <TrendingUp className="w-3.5 h-3.5" /> },
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-12">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <p className="section-label mb-1">KİŞİSEL ANALİZ</p>
                    <h1 className="font-display font-black text-3xl gradient-text-cyber tracking-wider uppercase flex items-center gap-3">
                        <BarChart2 className="w-8 h-8 text-mlbb-neonBlue" />
                        KAHRAMAN İSTATİSTİKLERİ
                    </h1>
                </div>
                <p className="text-gray-600 font-mono text-xs">
                    {heroStats.length} farklı kahraman · {allMatches.length} toplam maç
                </p>
            </div>

            {/* Sort Tabs */}
            <div className="flex gap-1 bg-black/50 p-1 rounded-xl border border-white/[0.06] w-fit">
                {SORT_OPTIONS.map(opt => (
                    <button
                        key={opt.key}
                        onClick={() => setSortBy(opt.key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold font-mono uppercase tracking-wider transition-all ${sortBy === opt.key
                            ? 'bg-mlbb-neonBlue/20 text-mlbb-neonBlue'
                            : 'text-gray-600 hover:text-gray-300'
                        }`}
                    >
                        {opt.icon} {opt.label}
                    </button>
                ))}
            </div>

            {/* Hero Cards */}
            {sorted.length === 0 ? (
                <div className="card-glass rounded-2xl border-dashed border border-white/[0.08] text-center py-20">
                    <BarChart2 className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-600 font-mono text-sm uppercase tracking-widest">
                        Henüz maç kaydı yok
                    </p>
                </div>
            ) : (
                <motion.div
                    key={sortBy}
                    variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
                    initial="hidden" animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                >
                    {sorted.map((stat, index) => {
                        const wrColor = stat.winRate >= 60
                            ? 'bg-mlbb-success'
                            : stat.winRate >= 50
                                ? 'bg-mlbb-neonBlue'
                                : stat.winRate >= 40
                                    ? 'bg-mlbb-gold'
                                    : 'bg-mlbb-danger';
                        const wrTextColor = stat.winRate >= 60
                            ? 'text-mlbb-success'
                            : stat.winRate >= 50
                                ? 'text-mlbb-neonBlue'
                                : stat.winRate >= 40
                                    ? 'text-mlbb-gold'
                                    : 'text-mlbb-danger';

                        return (
                            <motion.div
                                key={stat.heroId}
                                variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                                className="card-glass rounded-2xl overflow-hidden border border-white/[0.06] hover:border-mlbb-neonBlue/20 transition-colors group"
                            >
                                {/* Hero header */}
                                <div className="flex items-center gap-3 p-4 border-b border-white/[0.06]">
                                    {/* Rank badge */}
                                    <span className="text-xs font-mono text-gray-700 w-5 shrink-0">
                                        #{index + 1}
                                    </span>
                                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 shrink-0 group-hover:border-mlbb-neonBlue/30 transition-colors">
                                        <ImageWithFallback
                                            src={stat.imagePath}
                                            alt={stat.heroName}
                                            className="w-full h-full object-cover"
                                            fallbackText={stat.heroName.substring(0, 2)}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-display font-bold text-white text-sm truncate">{stat.heroName}</p>
                                        <div className="flex flex-wrap gap-1 mt-0.5">
                                            {stat.roles.map(r => (
                                                <span key={r} className="text-[9px] font-mono text-gray-600 uppercase">{t(`role_${r}`)}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="font-display font-black text-lg text-white">{stat.matches}</p>
                                        <p className="text-[10px] font-mono text-gray-600 uppercase">Maç</p>
                                    </div>
                                </div>

                                {/* Stats grid */}
                                <div className="p-4 space-y-3">
                                    {/* Win Rate bar */}
                                    <div>
                                        <div className="flex justify-between items-center mb-1.5">
                                            <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">Win Rate</span>
                                            <span className={`text-sm font-display font-bold ${wrTextColor}`}>{stat.winRate}%</span>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-700 ${wrColor}`}
                                                style={{ width: `${stat.winRate}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between mt-1">
                                            <span className="text-[9px] font-mono text-mlbb-success">{stat.wins}G</span>
                                            <span className="text-[9px] font-mono text-mlbb-danger">{stat.losses}M</span>
                                        </div>
                                    </div>

                                    {/* KDA + raw stats */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="rounded-xl bg-black/30 p-2.5 text-center">
                                            <p className="text-[9px] font-mono text-gray-600 uppercase mb-0.5">Ort. KDA</p>
                                            <p className="font-display font-bold text-base text-mlbb-neonBlue">{stat.avgKda}</p>
                                        </div>
                                        <div className="rounded-xl bg-black/30 p-2.5 text-center">
                                            <p className="text-[9px] font-mono text-gray-600 uppercase mb-0.5">K / D / A</p>
                                            <p className="font-mono text-xs text-white">
                                                <span className="text-white">{(stat.totalKills / stat.matches).toFixed(1)}</span>
                                                <span className="text-gray-700 mx-0.5">/</span>
                                                <span className="text-mlbb-danger">{(stat.totalDeaths / stat.matches).toFixed(1)}</span>
                                                <span className="text-gray-700 mx-0.5">/</span>
                                                <span className="text-white">{(stat.totalAssists / stat.matches).toFixed(1)}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}
        </div>
    );
};
