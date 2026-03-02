import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import type { MatchRecord } from '../types';
import { MLAnalyzer } from '../services/MLAnalyzer';
import { calculateObjectiveCurrentStats } from '../analytics/objectiveMath';
import { Trophy, Crosshair, Target, ChevronDown, Activity, Plus, BrainCircuit, Timer, Zap, Shield, Trash2, Filter, X, Check, TrendingDown, Flame, AlertTriangle } from 'lucide-react';
import { getHeroById } from '../data/heroes';
import { getItemById } from '../data/items';
import { Link } from 'react-router-dom';
import { ImageWithFallback } from './ImageWithFallback';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

type FilterResult = 'all' | 'Victory' | 'Defeat';
type FilterDate = 'all' | '7d' | '30d';

export const Dashboard: React.FC = () => {
    const { t } = useTranslation();
    const [matches, setMatches] = useState<MatchRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);
    const [matchMinute, setMatchMinute] = useState<number>(8);

    // Filter state
    const [filterHero, setFilterHero] = useState<string>('all');
    const [filterResult, setFilterResult] = useState<FilterResult>('all');
    const [filterDate, setFilterDate] = useState<FilterDate>('all');

    // Delete confirm state
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => { fetchMatches(); }, []);

    const fetchMatches = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const { data, error } = await supabase
                    .from('matches')
                    .select('*')
                    .eq('user_id', session.user.id)
                    .order('created_at', { ascending: false });
                if (error) throw error;
                setMatches(data || []);
            }
        } catch (err) {
            console.error('Match fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Unique heroes played (for filter dropdown)
    const uniqueHeroIds = useMemo(() =>
        [...new Set(matches.map(m => m.hero_id || m.heroId).filter(Boolean))],
        [matches]
    );

    // Filtered matches (client-side, data already in memory)
    const filteredMatches = useMemo(() => {
        const now = Date.now();
        return matches.filter(m => {
            if (filterHero !== 'all' && (m.hero_id || m.heroId) !== filterHero) return false;
            if (filterResult !== 'all' && m.result !== filterResult) return false;
            if (filterDate !== 'all') {
                const days = filterDate === '7d' ? 7 : 30;
                const cutoff = now - days * 24 * 60 * 60 * 1000;
                if (new Date(m.created_at ?? 0).getTime() < cutoff) return false;
            }
            return true;
        });
    }, [matches, filterHero, filterResult, filterDate]);

    const activeFilters = (filterHero !== 'all' ? 1 : 0) + (filterResult !== 'all' ? 1 : 0) + (filterDate !== 'all' ? 1 : 0);

    const handleDelete = async (matchId: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return;
            const { error } = await supabase
                .from('matches')
                .delete()
                .eq('id', matchId)
                .eq('user_id', session.user.id);
            if (error) throw error;
            setMatches(prev => prev.filter(m => m.id !== matchId));
            if (expandedMatchId === matchId) setExpandedMatchId(null);
        } catch (err) {
            console.error('Delete error:', err);
        } finally {
            setDeletingId(null);
        }
    };

    // Stats computed from ALL matches (not filtered — for the top cards)
    const totalMatches = matches.length;
    const wins = matches.filter(m => m.result === 'Victory').length;
    const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
    const totalKills = matches.reduce((acc, m) => acc + m.kills, 0);
    const totalDeaths = matches.reduce((acc, m) => acc + m.deaths, 0);
    const totalAssists = matches.reduce((acc, m) => acc + m.assists, 0);
    const safeDeaths = totalDeaths === 0 ? 1 : totalDeaths;
    const avgKda = totalMatches > 0 ? ((totalKills + totalAssists) / safeDeaths).toFixed(2) : '0.00';
    const coachVerdict = MLAnalyzer.getRecommendations(matches, t as (key: string, options?: unknown) => string);
    const radarData = MLAnalyzer.computeRadarMetrics(matches);
    const kdaTrendData = [...matches].reverse().map((m, index) => {
        const safeD = m.deaths === 0 ? 1 : m.deaths;
        return { name: `M${index + 1}`, KDA: Number(((m.kills + m.assists) / safeD).toFixed(2)) };
    });

    // Tilt/streak detection
    const tiltData = MLAnalyzer.detectTiltPattern(matches);

    // 30-day daily win rate trend
    const dailyTrendData = useMemo(() => {
        if (matches.length === 0) return [];
        const now = Date.now();
        const cutoff = now - 30 * 24 * 60 * 60 * 1000;
        const recent = matches.filter(m => new Date(m.created_at ?? 0).getTime() >= cutoff);
        const byDay: Record<string, { wins: number; total: number }> = {};
        recent.forEach(m => {
            const d = new Date(m.created_at ?? 0);
            const key = `${d.getMonth() + 1}/${d.getDate()}`;
            if (!byDay[key]) byDay[key] = { wins: 0, total: 0 };
            byDay[key].total++;
            if (m.result === 'Victory') byDay[key].wins++;
        });
        return Object.entries(byDay)
            .sort(([a], [b]) => {
                const parse = (s: string) => { const [mo, d] = s.split('/').map(Number); return mo * 100 + d; };
                return parse(a) - parse(b);
            })
            .map(([day, { wins, total }]) => ({
                name: day,
                WR: Math.round((wins / total) * 100),
                Maç: total,
            }));
    }, [matches]);

    if (loading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 rounded-full border-2 border-mlbb-neonBlue border-t-transparent animate-spin" />
                    <span className="text-gray-600 font-mono text-xs tracking-widest uppercase">Loading...</span>
                </div>
            </div>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
    };

    const winColor = winRate >= 60 ? '#00f0ff' : winRate >= 50 ? '#ffbf00' : '#ff2a2a';

    return (
        <div className="w-full space-y-6 animate-fade-in">

            {/* ── PAGE HEADER ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                <div>
                    <p className="section-label mb-1">{t('dashboard_title')}</p>
                    <h1 className="font-display font-black text-3xl sm:text-4xl tracking-tight text-white">
                        Kariyer <span className="gradient-text-cyber">Analizi</span>
                    </h1>
                </div>
                <Link
                    to="/add-match"
                    className="btn-cyber flex items-center gap-2 self-start sm:self-auto"
                >
                    <Plus className="w-4 h-4" />
                    {t('nav_add_match')}
                </Link>
            </div>

            {/* ── STAT CARDS ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Total Matches */}
                <div className="aurora-border group">
                    <div className="card-glass rounded-2xl p-6 relative overflow-hidden h-full">
                        <div className="absolute top-4 right-4 opacity-[0.07] group-hover:opacity-[0.12] transition-opacity">
                            <Activity className="w-20 h-20 text-white" />
                        </div>
                        <p className="section-label mb-3">{t('dash_total_matches')}</p>
                        <div className="stat-value text-white">{totalMatches}</div>
                        <p className="text-xs text-gray-600 mt-2 font-mono">{wins}W / {totalMatches - wins}L</p>
                    </div>
                </div>

                {/* Win Rate */}
                <div className="aurora-border group">
                    <div className="card-glass rounded-2xl p-6 relative overflow-hidden h-full">
                        <div className="absolute top-4 right-4 opacity-[0.07] group-hover:opacity-[0.12] transition-opacity">
                            <Trophy className="w-20 h-20" style={{ color: winColor }} />
                        </div>
                        <p className="section-label mb-3" style={{ color: winColor }}>{t('dash_win_rate')}</p>
                        <div className="stat-value" style={{ color: winColor }}>{winRate}%</div>
                        <div className="mt-3 h-1.5 rounded-full bg-white/5 overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-1000"
                                style={{ width: `${winRate}%`, background: `linear-gradient(90deg, ${winColor}, ${winColor}88)` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Avg KDA */}
                <div className="aurora-border group">
                    <div className="card-glass rounded-2xl p-6 relative overflow-hidden h-full">
                        <div className="absolute top-4 right-4 opacity-[0.07] group-hover:opacity-[0.12] transition-opacity">
                            <Crosshair className="w-20 h-20 text-mlbb-neonBlue" />
                        </div>
                        <p className="section-label mb-3">{t('dash_avg_kda')}</p>
                        <div className="stat-value text-mlbb-neonBlue text-glow-neon">{avgKda}</div>
                        <p className="text-xs text-gray-600 mt-2 font-mono">{totalKills}K / {totalDeaths}D / {totalAssists}A</p>
                    </div>
                </div>
            </div>

            {/* ── TILT / STREAK ALERT ── */}
            {tiltData.alert && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-xl border px-5 py-4 flex items-start gap-3 ${
                        tiltData.type === 'streak'
                            ? 'bg-mlbb-success/10 border-mlbb-success/40'
                            : 'bg-mlbb-danger/10 border-mlbb-danger/40'
                    }`}
                >
                    {tiltData.type === 'streak'
                        ? <Flame className="w-5 h-5 text-mlbb-success shrink-0 mt-0.5" />
                        : <TrendingDown className="w-5 h-5 text-mlbb-danger shrink-0 mt-0.5 animate-pulse" />
                    }
                    <p className={`font-mono text-sm leading-relaxed ${tiltData.type === 'streak' ? 'text-mlbb-success' : 'text-mlbb-danger'}`}>
                        {tiltData.alert}
                    </p>
                </motion.div>
            )}

            {/* ── AI COACH VERDICT ── */}
            <div className="card-glass rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-mlbb-neonBlue/40 to-transparent" />
                <div className="flex items-center gap-3 mb-5">
                    <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-mlbb-success/20 animate-pulse-slow" />
                        <div className="w-2 h-2 rounded-full bg-mlbb-success relative" />
                    </div>
                    <Target className="w-4 h-4 text-mlbb-neonBlue" />
                    <h2 className="font-display font-bold text-sm tracking-widest uppercase text-white">{t('dash_coach_verdict')}</h2>
                    <span className="ml-auto text-[10px] font-mono text-mlbb-success tracking-widest">ORACLE ONLINE</span>
                </div>
                <p className="text-gray-300 font-mono text-sm leading-relaxed pl-5 border-l-2 border-mlbb-neonBlue/30">
                    {coachVerdict}
                </p>
            </div>

            {/* ── CHARTS ── */}
            {matches.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* KDA Trend */}
                    <div className="card-glass rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Activity className="w-4 h-4 text-mlbb-neonBlue" />
                            <h3 className="font-display font-bold text-sm tracking-widest uppercase text-white">KDA Trendi</h3>
                        </div>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={kdaTrendData}>
                                    <XAxis dataKey="name" stroke="#333" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#333" fontSize={10} tickLine={false} axisLine={false} />
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: '#0c0c18', border: '1px solid rgba(0,240,255,0.2)', borderRadius: '10px', fontSize: '12px', fontFamily: 'monospace' }}
                                        itemStyle={{ color: '#00f0ff' }}
                                    />
                                    <Line type="monotone" dataKey="KDA" stroke="#00f0ff" strokeWidth={2}
                                        dot={{ fill: '#0c0c18', stroke: '#00f0ff', strokeWidth: 2, r: 3 }}
                                        activeDot={{ r: 5, fill: '#00f0ff', stroke: '#fff', strokeWidth: 2 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 30-Day WR Trend */}
                    {dailyTrendData.length >= 2 && (
                        <div className="card-glass rounded-2xl p-6 lg:col-span-2">
                            <div className="flex items-center gap-2 mb-6">
                                <AlertTriangle className="w-4 h-4 text-mlbb-gold" />
                                <h3 className="font-display font-bold text-sm tracking-widest uppercase text-white">30 Günlük Kazanma Oranı</h3>
                                <span className="ml-auto text-[10px] font-mono text-gray-600 uppercase tracking-widest">Son 30 gün</span>
                            </div>
                            <div className="h-44">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={dailyTrendData}>
                                        <XAxis dataKey="name" stroke="#333" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#333" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} unit="%" />
                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: '#0c0c18', border: '1px solid rgba(255,191,0,0.2)', borderRadius: '10px', fontSize: '12px', fontFamily: 'monospace' }}
                                            itemStyle={{ color: '#ffbf00' }}
                                            formatter={(val: number | undefined, name: string | undefined) => (name ?? '') === 'WR' ? [`%${val ?? 0}`, 'Win Rate'] : [val ?? 0, 'Maç sayısı']}
                                        />
                                        <Line type="monotone" dataKey="WR" stroke="#ffbf00" strokeWidth={2}
                                            dot={{ fill: '#0c0c18', stroke: '#ffbf00', strokeWidth: 2, r: 3 }}
                                            activeDot={{ r: 5, fill: '#ffbf00', stroke: '#fff', strokeWidth: 2 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* Radar */}
                    <div className="card-glass rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <BrainCircuit className="w-4 h-4 text-mlbb-gold" />
                            <h3 className="font-display font-bold text-sm tracking-widest uppercase text-white">DNA Analizi</h3>
                        </div>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                    <PolarGrid stroke="rgba(255,255,255,0.06)" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#555', fontSize: 10, fontFamily: 'monospace' }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar name="Oyuncu" dataKey="A" stroke="#ffbf00" strokeWidth={2} fill="#ffbf00" fillOpacity={0.12} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* ── TACTICAL PANEL ── */}
            <div className="card-glass rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-mlbb-gold/30 to-transparent" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-2">
                        <Timer className="w-4 h-4 text-mlbb-gold" />
                        <h2 className="font-display font-bold text-sm tracking-widest uppercase text-white">Taktik Analiz (V7)</h2>
                    </div>
                    <span className="font-mono text-mlbb-gold text-sm font-bold tracking-widest">
                        {String(Math.floor(matchMinute)).padStart(2, '0')}:{String(Math.round((matchMinute % 1) * 60)).padStart(2, '0')} dk
                    </span>
                </div>

                <input
                    type="range" min="1" max="30" value={matchMinute}
                    onChange={(e) => setMatchMinute(parseInt(e.target.value))}
                    className="w-full h-1 bg-white/10 appearance-none cursor-pointer accent-mlbb-gold mb-6 rounded-full"
                />

                {(() => {
                    const stats = calculateObjectiveCurrentStats(matchMinute);
                    return (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {/* Lord */}
                            <div className="bg-mlbb-gold/[0.04] border border-mlbb-gold/10 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Shield className="w-4 h-4 text-mlbb-gold" />
                                    <h3 className="text-xs font-bold text-mlbb-gold uppercase tracking-widest">{stats.lord.name}</h3>
                                </div>
                                <div className="space-y-2 text-xs font-mono">
                                    <div className="flex justify-between text-gray-500"><span>HP</span><span className="text-white">{stats.lord.hp > 0 ? stats.lord.hp.toLocaleString() : '—'}</span></div>
                                    <div className="flex justify-between text-gray-500"><span>ATK</span><span className="text-white">{stats.lord.attack > 0 ? stats.lord.attack : '—'}</span></div>
                                    <div className="flex justify-between text-gray-500"><span>DEF</span><span className="text-white">{stats.lord.physicalDefense > 0 ? stats.lord.physicalDefense : '—'}</span></div>
                                </div>
                            </div>

                            {/* Turtle */}
                            <div className={`bg-mlbb-neonBlue/[0.04] border border-mlbb-neonBlue/10 rounded-xl p-4 ${stats.turtle.type === 'None' ? 'opacity-40' : ''}`}>
                                <div className="flex items-center gap-2 mb-3">
                                    <Zap className="w-4 h-4 text-mlbb-neonBlue" />
                                    <h3 className="text-xs font-bold text-mlbb-neonBlue uppercase tracking-widest">Kaplumbağa</h3>
                                </div>
                                <div className="space-y-2 text-xs font-mono">
                                    <div className="flex justify-between text-gray-500"><span>HP</span><span className="text-white">{stats.turtle.hp > 0 ? stats.turtle.hp.toLocaleString() : '—'}</span></div>
                                    <div className="flex justify-between text-gray-500"><span>ATK</span><span className="text-white">{stats.turtle.attack > 0 ? stats.turtle.attack : '—'}</span></div>
                                    {stats.turtle.type === 'None' && <div className="text-mlbb-danger text-[10px] font-bold uppercase tracking-widest mt-2">Despawned</div>}
                                </div>
                            </div>

                            {/* Tower */}
                            <div className="bg-mlbb-purple/[0.04] border border-mlbb-purple/10 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Target className="w-4 h-4 text-mlbb-purpleLight" />
                                    <h3 className="text-xs font-bold text-mlbb-purpleLight uppercase tracking-widest">Dış Kule</h3>
                                </div>
                                <div className="space-y-2 text-xs font-mono">
                                    <div className="flex justify-between text-gray-500">
                                        <span>Kalkan</span>
                                        <span className={`font-bold ${matchMinute < 5 ? 'text-mlbb-gold' : 'text-mlbb-danger'}`}>{matchMinute < 5 ? 'AKTİF' : 'DÜŞTÜ'}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-500"><span>DEF</span><span className="text-white">{stats.outerTurret.physicalDefense}</span></div>
                                </div>
                            </div>
                        </div>
                    );
                })()}
            </div>

            {/* ── MATCH HISTORY ── */}
            <div className="space-y-4">
                {/* History Header */}
                <div className="flex items-center justify-between">
                    <h2 className="font-display font-bold text-xl text-white tracking-wide">{t('match_history')}</h2>
                    <div className="flex items-center gap-2">
                        {activeFilters > 0 && (
                            <span className="text-[10px] font-mono text-mlbb-neonBlue bg-mlbb-neonBlue/10 border border-mlbb-neonBlue/30 px-2 py-0.5 rounded-full">
                                {activeFilters} filtre
                            </span>
                        )}
                        <span className="section-label">{filteredMatches.length}/{totalMatches} maç</span>
                    </div>
                </div>

                {/* Filter Bar */}
                {matches.length > 0 && (
                    <div className="card-glass rounded-xl p-3 flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1.5 text-gray-600 shrink-0">
                            <Filter className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-mono uppercase tracking-widest">Filtre</span>
                        </div>

                        {/* Hero filter */}
                        <select
                            value={filterHero}
                            onChange={e => setFilterHero(e.target.value)}
                            className="input-cyber text-xs py-1.5 px-3 flex-1 min-w-[120px]"
                        >
                            <option value="all">Tüm Kahramanlar</option>
                            {uniqueHeroIds.map(hid => {
                                const hero = getHeroById(hid);
                                return <option key={hid} value={hid}>{hero?.name ?? hid}</option>;
                            })}
                        </select>

                        {/* Result filter */}
                        <div className="flex gap-1">
                            {(['all', 'Victory', 'Defeat'] as FilterResult[]).map(r => (
                                <button
                                    key={r}
                                    onClick={() => setFilterResult(r)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-widest transition-all border ${
                                        filterResult === r
                                            ? r === 'Victory'
                                                ? 'bg-mlbb-neonBlue/20 border-mlbb-neonBlue/40 text-mlbb-neonBlue'
                                                : r === 'Defeat'
                                                    ? 'bg-mlbb-danger/20 border-mlbb-danger/40 text-mlbb-danger'
                                                    : 'bg-white/10 border-white/20 text-white'
                                            : 'border-white/[0.06] text-gray-600 hover:text-gray-300'
                                    }`}
                                >
                                    {r === 'all' ? 'Tümü' : r === 'Victory' ? 'Galibiyet' : 'Mağlubiyet'}
                                </button>
                            ))}
                        </div>

                        {/* Date filter */}
                        <div className="flex gap-1">
                            {([['all', 'Tümü'], ['7d', '7 Gün'], ['30d', '30 Gün']] as [FilterDate, string][]).map(([val, label]) => (
                                <button
                                    key={val}
                                    onClick={() => setFilterDate(val)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-widest transition-all border ${
                                        filterDate === val
                                            ? 'bg-mlbb-gold/20 border-mlbb-gold/40 text-mlbb-gold'
                                            : 'border-white/[0.06] text-gray-600 hover:text-gray-300'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* Clear filters */}
                        {activeFilters > 0 && (
                            <button
                                onClick={() => { setFilterHero('all'); setFilterResult('all'); setFilterDate('all'); }}
                                className="ml-auto flex items-center gap-1 text-[10px] font-mono text-gray-600 hover:text-mlbb-danger transition-colors"
                            >
                                <X className="w-3 h-3" /> Temizle
                            </button>
                        )}
                    </div>
                )}

                {/* Match List */}
                {matches.length === 0 ? (
                    <div className="card-glass rounded-2xl p-12 text-center border-dashed border-2 border-white/[0.06]">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-mlbb-neonBlue/10 flex items-center justify-center">
                            <Plus className="w-8 h-8 text-mlbb-neonBlue/50" />
                        </div>
                        <p className="text-gray-500 mb-4">{t('dash_no_matches')}</p>
                        <Link to="/add-match" className="btn-cyber inline-flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            {t('dash_add_first_match')}
                        </Link>
                    </div>
                ) : filteredMatches.length === 0 ? (
                    <div className="card-glass rounded-2xl p-10 text-center border border-white/[0.06]">
                        <p className="text-gray-600 font-mono text-sm uppercase tracking-widest">Bu filtreyle eşleşen maç yok</p>
                        <button
                            onClick={() => { setFilterHero('all'); setFilterResult('all'); setFilterDate('all'); }}
                            className="mt-4 text-xs text-mlbb-neonBlue font-mono hover:underline"
                        >
                            Filtreleri temizle
                        </button>
                    </div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="flex flex-col gap-3"
                    >
                        {filteredMatches.map((match) => {
                            const hero = getHeroById(match.hero_id || match.heroId);
                            const isVictory = match.result === 'Victory';
                            const isExpanded = expandedMatchId === match.id;
                            const isConfirmingDelete = deletingId === match.id;

                            return (
                                <motion.div key={match.id} variants={itemVariants}>
                                    <div
                                        className={`card-glass rounded-xl overflow-hidden transition-all duration-200 ${
                                            isVictory ? 'match-card-victory' : 'match-card-defeat'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4 p-4">
                                            {/* Hero Image — clickable to expand */}
                                            <div
                                                className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/10 cursor-pointer"
                                                onClick={() => setExpandedMatchId(isExpanded ? null : match.id)}
                                            >
                                                {hero ? (
                                                    <ImageWithFallback
                                                        src={hero.imagePath} alt={hero.name}
                                                        className="w-full h-full object-cover"
                                                        fallbackText={hero.name.substring(0, 2)}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-900 flex items-center justify-center text-gray-700 font-bold text-xs">?</div>
                                                )}
                                            </div>

                                            {/* Hero + KDA — clickable to expand */}
                                            <div
                                                className="flex-1 min-w-0 cursor-pointer"
                                                onClick={() => setExpandedMatchId(isExpanded ? null : match.id)}
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-display font-bold text-sm text-white truncate">{hero?.name ?? 'Unknown'}</span>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                                        isVictory
                                                            ? 'bg-mlbb-neonBlue/15 text-mlbb-neonBlue'
                                                            : 'bg-mlbb-danger/15 text-mlbb-danger'
                                                    }`}>
                                                        {isVictory ? t('match_card_victory') : t('match_card_defeat')}
                                                    </span>
                                                </div>
                                                <div className="font-mono text-sm">
                                                    <span className="text-white font-bold">{match.kills}</span>
                                                    <span className="text-gray-600 mx-1">/</span>
                                                    <span className="text-mlbb-danger font-bold">{match.deaths}</span>
                                                    <span className="text-gray-600 mx-1">/</span>
                                                    <span className="text-white font-bold">{match.assists}</span>
                                                </div>
                                            </div>

                                            {/* Items */}
                                            <div className="hidden sm:flex items-center gap-1">
                                                {match.items?.slice(0, 6).map((itemId, idx) => {
                                                    const item = getItemById(itemId);
                                                    return (
                                                        <div key={idx} className="w-8 h-8 rounded-lg overflow-hidden border border-white/[0.08] bg-black/40" title={item?.name}>
                                                            {item ? (
                                                                <ImageWithFallback src={item.iconUrl} alt={item.name} className="w-full h-full object-cover" fallbackText="IT" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-700">?</div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Delete + Expand controls */}
                                            <div className="flex items-center gap-2 shrink-0">
                                                {isConfirmingDelete ? (
                                                    /* Inline confirm */
                                                    <div className="flex items-center gap-1.5">
                                                        <button
                                                            onClick={() => handleDelete(match.id)}
                                                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-mlbb-danger/20 border border-mlbb-danger/40 text-mlbb-danger text-[10px] font-mono font-bold uppercase hover:bg-mlbb-danger/30 transition-colors"
                                                        >
                                                            <Check className="w-3 h-3" /> Sil
                                                        </button>
                                                        <button
                                                            onClick={() => setDeletingId(null)}
                                                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-white/10 text-gray-500 text-[10px] font-mono font-bold uppercase hover:text-white transition-colors"
                                                        >
                                                            <X className="w-3 h-3" /> İptal
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setDeletingId(match.id); }}
                                                        className="p-1.5 rounded-lg text-gray-700 hover:text-mlbb-danger hover:bg-mlbb-danger/10 transition-all"
                                                        title="Maçı sil"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <ChevronDown
                                                    onClick={() => setExpandedMatchId(isExpanded ? null : match.id)}
                                                    className={`w-4 h-4 text-gray-600 cursor-pointer transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                                />
                                            </div>
                                        </div>

                                        {/* Expanded Section */}
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="px-4 pb-4 pt-1 border-t border-white/[0.06] flex flex-col sm:flex-row gap-4">
                                                        <div className="sm:w-1/4 p-3 rounded-xl bg-white/[0.03]">
                                                            <p className="section-label mb-1">{t('match_card_playstyle')}</p>
                                                            <p className="text-sm font-display font-semibold text-white mt-1">{match.playstyle_tag || 'Balanced'}</p>
                                                        </div>
                                                        <div className="sm:w-3/4 p-3 rounded-xl bg-mlbb-neonBlue/[0.04] border border-mlbb-neonBlue/10">
                                                            <p className="section-label mb-2">AI Koç Notu</p>
                                                            <p className="text-gray-400 font-mono text-xs leading-relaxed">
                                                                {match.coach_note || 'Veri bulunamadı.'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </div>
        </div>
    );
};
