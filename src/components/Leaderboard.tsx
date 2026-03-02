import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { Trophy, Medal, Crown, Activity, Loader2 } from 'lucide-react';
import { HEROES } from '../data/heroes';
import { ImageWithFallback } from './ImageWithFallback';
import { motion } from 'framer-motion';

interface LeaderboardEntry {
    user_id: string;
    nickname: string;
    avatar_hero_id: string;
    total_matches: number;
    wins: number;
    win_rate: number;
    avg_kda: number;
    oracle_score: number;
}

export const Leaderboard: React.FC = () => {
    const { t } = useTranslation();
    const [players, setPlayers] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState<'win_rate' | 'oracle_score'>('win_rate');

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase.rpc('get_leaderboard');
                if (error) throw error;
                setPlayers(data || []);
            } catch (err) {
                console.error("Leaderboard error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    const sortedPlayers = [...players].sort((a, b) => b[sortBy] - a[sortBy]);

    const getRankConfig = (index: number) => {
        switch (index) {
            case 0: return {
                border: 'border-mlbb-gold/50', bg: 'bg-mlbb-gold/5', glow: 'shadow-[0_0_20px_rgba(255,191,0,0.15)]',
                text: 'text-mlbb-gold', badge: <Crown className="w-6 h-6 text-mlbb-gold" />, num: '01'
            };
            case 1: return {
                border: 'border-gray-400/30', bg: 'bg-gray-400/5', glow: '',
                text: 'text-gray-300', badge: <Medal className="w-6 h-6 text-gray-300" />, num: '02'
            };
            case 2: return {
                border: 'border-amber-700/40', bg: 'bg-amber-700/5', glow: '',
                text: 'text-amber-600', badge: <Medal className="w-5 h-5 text-amber-600" />, num: '03'
            };
            default: return {
                border: 'border-white/[0.06]', bg: 'bg-transparent', glow: '',
                text: 'text-gray-500', badge: null, num: String(index + 1).padStart(2, '0')
            };
        }
    };

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

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <p className="section-label mb-1">GLOBAL SIRALAMALAR</p>
                    <h1 className="font-display font-black text-3xl gradient-text-cyber tracking-wider uppercase flex items-center gap-3">
                        <Trophy className="w-8 h-8 text-mlbb-gold" />
                        {t('leaderboard_title')}
                    </h1>
                </div>
                {/* Sort Toggle */}
                <div className="flex gap-1 bg-black/50 p-1 rounded-xl border border-white/[0.06] shrink-0">
                    <button
                        onClick={() => setSortBy('win_rate')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold font-mono uppercase tracking-wider transition-all ${sortBy === 'win_rate' ? 'bg-mlbb-gold/20 text-mlbb-gold' : 'text-gray-600 hover:text-gray-300'}`}
                    >
                        <Trophy className="w-3.5 h-3.5" /> {t('leaderboard_winrate')}
                    </button>
                    <button
                        onClick={() => setSortBy('oracle_score')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold font-mono uppercase tracking-wider transition-all ${sortBy === 'oracle_score' ? 'bg-mlbb-neonBlue/20 text-mlbb-neonBlue' : 'text-gray-600 hover:text-gray-300'}`}
                    >
                        <Activity className="w-3.5 h-3.5" /> {t('leaderboard_oracle_score')}
                    </button>
                </div>
            </div>

            {/* Player List */}
            {sortedPlayers.length === 0 ? (
                <div className="card-glass rounded-2xl border-dashed border border-white/[0.08] text-center py-20 text-gray-600 font-mono">
                    {t('leaderboard_empty')}
                </div>
            ) : (
                <motion.div
                    variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } }}
                    initial="hidden" animate="visible"
                    className="space-y-2"
                >
                    {sortedPlayers.map((player, index) => {
                        const cfg = getRankConfig(index);
                        const hero = HEROES[player.avatar_hero_id] || Object.values(HEROES)[0];
                        const isTop3 = index < 3;

                        return (
                            <motion.div
                                key={player.user_id}
                                variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
                                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 hover:scale-[1.01] group ${cfg.border} ${cfg.bg} ${cfg.glow}`}
                            >
                                {/* Rank */}
                                <div className="w-10 flex items-center justify-center shrink-0">
                                    {cfg.badge ?? (
                                        <span className={`font-mono font-bold text-sm ${cfg.text}`}>#{cfg.num}</span>
                                    )}
                                </div>

                                {/* Avatar */}
                                <div className={`w-12 h-12 rounded-xl overflow-hidden border shrink-0 transition-transform group-hover:scale-110 ${isTop3 ? cfg.border : 'border-white/[0.06]'}`}>
                                    <ImageWithFallback src={hero?.imagePath} alt={player.nickname} className="w-full h-full object-cover" fallbackText="P" />
                                </div>

                                {/* Name + stats */}
                                <div className="flex-1 min-w-0">
                                    <h3 className={`font-display font-bold text-base truncate ${isTop3 ? 'text-white' : 'text-gray-300'}`}>
                                        {player.nickname}
                                    </h3>
                                    <p className="text-xs font-mono text-gray-600 mt-0.5">
                                        KDA <span className="text-gray-400">{player.avg_kda}</span>
                                        <span className="mx-1.5 opacity-30">·</span>
                                        <span className="text-gray-500">{player.total_matches} maç</span>
                                    </p>
                                </div>

                                {/* Stats */}
                                <div className="flex items-center gap-6 shrink-0">
                                    <div className="text-right">
                                        <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-0.5">{t('leaderboard_winrate')}</p>
                                        <p className={`font-display font-bold text-xl ${sortBy === 'win_rate' ? cfg.text : 'text-white'}`}>
                                            {player.win_rate}%
                                        </p>
                                    </div>
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-0.5">Oracle</p>
                                        <p className={`font-display font-bold text-xl ${sortBy === 'oracle_score' ? cfg.text : 'text-white'}`}>
                                            {player.oracle_score}
                                        </p>
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
