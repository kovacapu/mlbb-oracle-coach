import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Target, Lightbulb, Trophy, ShieldAlert, HeartHandshake, Plus, AlertTriangle, BrainCircuit, Loader2 } from 'lucide-react';
import type { MatchAnalysisResult } from '../services/MLAnalyzer';
import { getItemById } from '../data/items';
import { getEmblemById } from '../data/emblems';
import { ImageWithFallback } from './ImageWithFallback';

interface PostMatchAnalysisProps {
    analysis: MatchAnalysisResult;
    onClose: () => void;
    aiCoachNote?: string;
    isLoadingAI?: boolean;
    aiError?: string;
}

const PLAYSTYLE_KEY_MAP: Record<string, string> = {
    'Aggressive Carry': 'playstyle_aggressive_carry',
    'Risky/Overextended': 'playstyle_risky_overextended',
    'Supportive': 'playstyle_supportive',
    'Balanced': 'playstyle_balanced',
};

export const PostMatchAnalysis: React.FC<PostMatchAnalysisProps> = ({ analysis, onClose, aiCoachNote, isLoadingAI, aiError }) => {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 50);
        return () => clearTimeout(timer);
    }, []);

    const getPlaystyleConfig = (style: string) => {
        switch (style) {
            case 'Aggressive Carry':
                return { icon: Trophy, color: 'text-mlbb-gold', glow: 'shadow-[0_0_20px_rgba(255,191,0,0.3)]', border: 'border-mlbb-gold/40', bg: 'bg-mlbb-gold/10', bar: 'bg-mlbb-gold' };
            case 'Risky/Overextended':
                return { icon: ShieldAlert, color: 'text-mlbb-danger', glow: 'shadow-[0_0_20px_rgba(255,50,80,0.3)]', border: 'border-mlbb-danger/40', bg: 'bg-mlbb-danger/10', bar: 'bg-mlbb-danger' };
            case 'Supportive':
                return { icon: HeartHandshake, color: 'text-mlbb-success', glow: 'shadow-[0_0_20px_rgba(0,255,136,0.3)]', border: 'border-mlbb-success/40', bg: 'bg-mlbb-success/10', bar: 'bg-mlbb-success' };
            default:
                return { icon: Target, color: 'text-mlbb-neonBlue', glow: 'shadow-[0_0_20px_rgba(0,240,255,0.3)]', border: 'border-mlbb-neonBlue/40', bg: 'bg-mlbb-neonBlue/10', bar: 'bg-mlbb-neonBlue' };
        }
    };

    const config = getPlaystyleConfig(analysis.playStyle);
    const Icon = config.icon;
    const isWarning = analysis.coachNote.includes('⚠️');
    const translatedPlaystyle = t(PLAYSTYLE_KEY_MAP[analysis.playStyle] || 'playstyle_balanced');
    const kda = parseFloat(analysis.kdaRatio.toString());
    const kdaColor = kda >= 4 ? 'text-mlbb-success' : kda >= 2.5 ? 'text-mlbb-neonBlue' : kda >= 1.5 ? 'text-mlbb-gold' : 'text-mlbb-danger';

    return (
        <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'} w-full max-w-3xl mx-auto pb-12`}>

            {/* Top Label */}
            <div className="text-center mb-6">
                <p className="section-label">ORACLE ANALİZ RAPORU</p>
            </div>

            {/* Main Card */}
            <div className={`aurora-border ${config.glow} rounded-2xl`}>
                <div className="card-glass rounded-2xl relative overflow-hidden">

                    {/* Ambient glow */}
                    <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent ${config.bar === 'bg-mlbb-gold' ? 'via-mlbb-gold/60' : config.bar === 'bg-mlbb-danger' ? 'via-mlbb-danger/60' : config.bar === 'bg-mlbb-success' ? 'via-mlbb-success/60' : 'via-mlbb-neonBlue/60'} to-transparent`} />

                    <div className="p-8 sm:p-10 space-y-8">

                        {/* KDA + Playstyle Hero Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* KDA Display */}
                            <div className="flex flex-col items-center justify-center text-center rounded-2xl border border-white/[0.06] bg-black/30 p-8">
                                <p className="section-label mb-3">{t('post_match_kda_label')}</p>
                                <div className={`font-display font-black text-7xl ${kdaColor}`}>
                                    {analysis.kdaRatio}
                                </div>
                                <div className={`mt-3 text-xs font-mono ${kdaColor} opacity-70`}>
                                    {kda >= 4 ? 'EFSANE PERFORMANS' : kda >= 2.5 ? 'GÜÇLÜ PERFORMANS' : kda >= 1.5 ? 'DENGELI OYNANIŞ' : 'GELİŞTİRİLEBİLİR'}
                                </div>
                            </div>

                            {/* Playstyle Badge */}
                            <div className={`flex flex-col items-center justify-center text-center rounded-2xl border ${config.border} ${config.bg} p-8 relative overflow-hidden`}>
                                <div className={`absolute inset-0 opacity-10 ${config.bg} pointer-events-none`} />
                                <div className="relative">
                                    <div className={`absolute inset-0 blur-2xl ${config.bg} scale-150`} />
                                    <Icon className={`relative w-14 h-14 mb-4 ${config.color}`} />
                                </div>
                                <p className="section-label mb-2">{t('post_match_style_label')}</p>
                                <h3 className={`font-display font-black text-2xl ${config.color} tracking-wider uppercase`}>
                                    {translatedPlaystyle}
                                </h3>
                            </div>
                        </div>

                        {/* Coach Note */}
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="relative">
                                    <div className={`absolute inset-0 blur-sm ${isWarning ? 'bg-mlbb-danger/30' : 'bg-mlbb-gold/30'} rounded-full`} />
                                    <Lightbulb className={`relative w-5 h-5 ${isWarning ? 'text-mlbb-danger' : 'text-mlbb-gold'}`} />
                                </div>
                                <h4 className="font-display font-bold text-white text-lg tracking-wider uppercase">{t('post_match_coach_note')}</h4>
                            </div>
                            <div className={`rounded-r-xl border-l-2 ${isWarning ? 'border-mlbb-danger bg-mlbb-danger/5' : 'border-mlbb-gold bg-mlbb-gold/5'} p-5 pl-6`}>
                                <p className="text-gray-300 leading-relaxed">
                                    {analysis.coachNote}
                                </p>
                            </div>
                        </div>

                        {/* Visual Incompatibility Panel */}
                        {((analysis.incompatibleItemIds && analysis.incompatibleItemIds.length > 0) || analysis.incompatibleEmblemId) && (
                            <div className="rounded-2xl border border-mlbb-danger/30 bg-mlbb-danger/5 p-5 space-y-4">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-mlbb-danger" />
                                    <p className="text-xs font-mono font-bold text-mlbb-danger uppercase tracking-widest">Uyumsuzluk Detayı</p>
                                </div>

                                {/* Incompatible Items */}
                                {analysis.incompatibleItemIds && analysis.incompatibleItemIds.length > 0 && (
                                    <div>
                                        <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-2">Uyumsuz Eşyalar</p>
                                        <div className="flex flex-wrap gap-2">
                                            {analysis.incompatibleItemIds.map(itemId => {
                                                const item = getItemById(itemId);
                                                if (!item) return null;
                                                return (
                                                    <div key={itemId} className="flex flex-col items-center gap-1 group">
                                                        <div className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-mlbb-danger/60 shadow-[0_0_10px_rgba(255,50,80,0.2)]">
                                                            <ImageWithFallback
                                                                src={item.iconUrl} alt={item.name}
                                                                className="w-full h-full object-cover"
                                                                fallbackText={item.name.substring(0, 2)}
                                                            />
                                                            {/* Red X overlay */}
                                                            <div className="absolute inset-0 bg-mlbb-danger/30 flex items-center justify-center">
                                                                <span className="text-white font-black text-lg leading-none drop-shadow">✕</span>
                                                            </div>
                                                        </div>
                                                        <p className="text-[9px] font-mono text-mlbb-danger/80 text-center max-w-[3rem] leading-tight">{item.name}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Incompatible Emblem */}
                                {analysis.incompatibleEmblemId && (() => {
                                    const emblem = getEmblemById(analysis.incompatibleEmblemId!);
                                    if (!emblem) return null;
                                    return (
                                        <div>
                                            <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-2">Uyumsuz Amblem</p>
                                            <div className="flex items-center gap-3 rounded-xl border border-mlbb-danger/30 bg-black/30 p-3 w-fit">
                                                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-mlbb-danger/60 shadow-[0_0_10px_rgba(255,50,80,0.2)]">
                                                    <ImageWithFallback
                                                        src={emblem.iconUrl} alt={emblem.name}
                                                        className="w-full h-full object-cover"
                                                        fallbackText={emblem.name.substring(0, 2)}
                                                    />
                                                    <div className="absolute inset-0 bg-mlbb-danger/30 flex items-center justify-center">
                                                        <span className="text-white font-black text-lg leading-none drop-shadow">✕</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white">{emblem.name}</p>
                                                    <p className="text-[10px] font-mono text-mlbb-danger mt-0.5">Bu kahraman için uyumsuz</p>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {emblem.roleFocus.map(r => (
                                                            <span key={r} className="text-[8px] font-mono text-gray-600 border border-gray-800 rounded px-1">{r}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}

                        {/* Gemini AI Coaching Section */}
                        {(isLoadingAI || aiCoachNote || aiError) && (
                            <div className="rounded-2xl border border-mlbb-purple/30 bg-mlbb-purple/5 p-5 space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <div className="absolute inset-0 blur-sm bg-mlbb-purple/40 rounded-full" />
                                        <BrainCircuit className="relative w-5 h-5 text-mlbb-purple" />
                                    </div>
                                    <p className="text-xs font-mono font-bold text-mlbb-purple uppercase tracking-widest">Gemini AI Koç</p>
                                    {isLoadingAI && (
                                        <Loader2 className="w-3.5 h-3.5 text-mlbb-purple/60 animate-spin ml-auto" />
                                    )}
                                </div>

                                {isLoadingAI && !aiCoachNote && (
                                    <div className="space-y-2">
                                        <div className="h-3 bg-mlbb-purple/10 rounded animate-pulse w-full" />
                                        <div className="h-3 bg-mlbb-purple/10 rounded animate-pulse w-5/6" />
                                        <div className="h-3 bg-mlbb-purple/10 rounded animate-pulse w-4/6" />
                                    </div>
                                )}

                                {aiError && !aiCoachNote && (
                                    <p className="text-[11px] font-mono text-mlbb-danger/70 leading-relaxed">{aiError}</p>
                                )}

                                {aiCoachNote && (
                                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{aiCoachNote}</p>
                                )}
                            </div>
                        )}

                        {/* Action Button */}
                        <div className="flex justify-center pt-2">
                            <button
                                onClick={() => { setIsVisible(false); setTimeout(onClose, 500); }}
                                className="btn-ghost flex items-center gap-2 px-8 py-3"
                            >
                                <Plus className="w-4 h-4" />
                                {t('post_match_add_match')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
