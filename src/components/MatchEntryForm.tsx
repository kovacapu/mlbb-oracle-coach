import React, { useState, useEffect } from 'react';
import { getAllHeroes } from '../data/heroes';
import { getAllItems } from '../data/items';
import { getAllEmblems, getEmblemById } from '../data/emblems';
import { SPELLS } from '../data/spells';
import { Sword, Plus, X, Shield, Goal, Crosshair, Loader2, Zap, BrainCircuit, Upload, ScanLine, AlertTriangle, AlertCircle } from 'lucide-react';
import { MLAnalyzer } from '../services/MLAnalyzer';
import { getHeroById } from '../data/heroes';

import { scanMatchResult } from '../analytics/ocrEngine';
import type { MatchAnalysisResult } from '../services/MLAnalyzer';
import { PostMatchAnalysis } from './PostMatchAnalysis';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { ImageWithFallback } from './ImageWithFallback';

const heroes = getAllHeroes();
const items = getAllItems();
const emblems = getAllEmblems();
const spells = Object.values(SPELLS);

interface HeroBuild {
    spellId: string;
    emblemId: string;
    tier1Id: string;
    tier2Id: string;
    coreId: string;
    items: string[];
}

export const MatchEntryForm: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [selectedHeroId, setSelectedHeroId] = useState<string>('');
    const [selectedSpellId, setSelectedSpellId] = useState<string>('');
    const [selectedEmblemId, setSelectedEmblemId] = useState<string>('');
    const [selectedTier1Id, setSelectedTier1Id] = useState<string>('');
    const [selectedTier2Id, setSelectedTier2Id] = useState<string>('');
    const [selectedCoreId, setSelectedCoreId] = useState<string>('');
    const [kills, setKills] = useState<number>(0);
    const [deaths, setDeaths] = useState<number>(0);
    const [assists, setAssists] = useState<number>(0);
    const [result, setResult] = useState<'Victory' | 'Defeat'>('Victory');
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<MatchAnalysisResult | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scanError, setScanError] = useState<string | null>(null);
    const [scanDebug, setScanDebug] = useState<string | null>(null);
    const [scanSuccess, setScanSuccess] = useState<string | null>(null);
    const [playerNickname, setPlayerNickname] = useState<string>('');
    const [heroBuilds, setHeroBuilds] = useState<Record<string, HeroBuild>>({});

    // Fetch nickname + saved hero builds from profile on mount
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session?.user) return;
            supabase
                .from('profiles')
                .select('nickname, hero_builds')
                .eq('user_id', session.user.id)
                .single()
                .then(({ data }) => {
                    if (data?.nickname) setPlayerNickname(data.nickname);
                    if (data?.hero_builds) setHeroBuilds(data.hero_builds);
                });
        });
    }, []);

    // Auto-load saved build when hero changes
    useEffect(() => {
        if (!selectedHeroId) return;
        const build = heroBuilds[selectedHeroId];
        if (build) {
            setSelectedSpellId(build.spellId || '');
            setSelectedEmblemId(build.emblemId || '');
            setSelectedTier1Id(build.tier1Id || '');
            setSelectedTier2Id(build.tier2Id || '');
            setSelectedCoreId(build.coreId || '');
            setSelectedItems(build.items || []);
        } else {
            // No saved build — clear previous hero's selections
            setSelectedSpellId('');
            setSelectedEmblemId('');
            setSelectedTier1Id('');
            setSelectedTier2Id('');
            setSelectedCoreId('');
            setSelectedItems([]);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedHeroId]);

    const handleImageScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        // Reset input so same file can be re-scanned
        e.target.value = '';
        setIsScanning(true);
        setScanError(null);
        setScanDebug(null);
        setScanSuccess(null);
        try {
            const ocr = await scanMatchResult(file, i18n.language === 'tr' ? 'tur' : 'eng', playerNickname || undefined);
            if (ocr.success && ocr.data) {
                if (ocr.data.kills !== undefined) setKills(ocr.data.kills);
                if (ocr.data.deaths !== undefined) setDeaths(ocr.data.deaths);
                if (ocr.data.assists !== undefined) setAssists(ocr.data.assists);
                if (ocr.data.heroId) setSelectedHeroId(ocr.data.heroId);
                if (ocr.data.result) setResult(ocr.data.result);
                // Show what was extracted so user can verify correctness
                const parts: string[] = [];
                if (ocr.data.kills !== undefined) parts.push(`K:${ocr.data.kills} D:${ocr.data.deaths} A:${ocr.data.assists}`);
                if (ocr.data.heroName) parts.push(ocr.data.heroName);
                if (ocr.data.result) parts.push(ocr.data.result === 'Victory' ? '✓ Galibiyet' : '✗ Mağlubiyet');
                setScanSuccess(`Tarandı — ${parts.join(' · ')} (%${Math.round(ocr.confidence)} güven)`);
            } else {
                const confPct = Math.round(ocr.confidence);
                setScanError(t(ocr.errorMsg || 'ocr_error_no_data_found'));
                if (ocr.rawText) {
                    setScanDebug(`OCR güven: %${confPct} · Okunan: "${ocr.rawText.slice(0, 120).replace(/\n/g, ' ')}"`);
                } else {
                    setScanDebug(`OCR güven: %${confPct} — Metin okunamadı`);
                }
            }
        } catch {
            setScanError(t('ocr_error_engine_failed'));
        } finally {
            setIsScanning(false);
        }
    };

    const addItem = (itemId: string) => {
        if (selectedItems.length < 6 && !selectedItems.includes(itemId)) {
            setSelectedItems([...selectedItems, itemId]);
            if (selectedItems.length === 5) setIsItemModalOpen(false);
        }
    };

    const removeItem = (itemId: string) => {
        setSelectedItems(selectedItems.filter(id => id !== itemId));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);
        if (!selectedHeroId) { setSubmitError(t('form_err_hero')); return; }
        setIsSubmitting(true);
        try {
            const resultPayload = MLAnalyzer.analyzeMatch(selectedHeroId, kills, deaths, assists, selectedItems, selectedEmblemId || undefined, selectedTier1Id || undefined, selectedTier2Id || undefined);
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) throw sessionError;
            if (!session?.user) throw new Error("Oturum bulunamadı. Lütfen tekrar giriş yapın.");
            const { error: insertError } = await supabase.from('matches').insert([{
                user_id: session.user.id,
                hero_id: selectedHeroId,
                ...(selectedEmblemId ? { emblem_id: selectedEmblemId } : {}),
                ...(selectedTier1Id ? { emblem_tier1_id: selectedTier1Id } : {}),
                ...(selectedTier2Id ? { emblem_tier2_id: selectedTier2Id } : {}),
                ...(selectedCoreId ? { emblem_core_id: selectedCoreId } : {}),
                ...(selectedSpellId ? { battle_spell_id: selectedSpellId } : {}),
                kills, deaths, assists, result,
                items: selectedItems,
                playstyle_tag: resultPayload.playStyle,
                coach_note: resultPayload.coachNote
            }]);
            if (insertError) throw insertError;
            setAnalysisResult(resultPayload);
        } catch (err: any) {
            setSubmitError(err.message || t('form_err_generic'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setAnalysisResult(null);
        setSelectedHeroId(''); setSelectedSpellId('');
        setKills(0); setDeaths(0); setAssists(0);
        setSelectedItems([]); setResult('Victory');
        setSelectedEmblemId(''); setSelectedTier1Id(''); setSelectedTier2Id('');
        setIsItemModalOpen(false);
    };

    if (analysisResult) {
        return <PostMatchAnalysis analysis={analysisResult} onClose={resetForm} />;
    }

    const selectedEmblemData = selectedEmblemId ? getEmblemById(selectedEmblemId) : null;

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6 pb-12">

            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="section-label mb-1">SAVAŞ KAYDI</p>
                    <h1 className="font-display font-black text-3xl gradient-text-cyber tracking-wider uppercase">
                        {t('form_title')}
                    </h1>
                </div>

                {/* OCR Scan Buttons — Gallery + Camera */}
                <div className="flex items-center gap-2 shrink-0">
                    {/* Gallery picker */}
                    <div className="relative">
                        <input
                            id="ocr-gallery"
                            type="file" accept="image/*"
                            onChange={handleImageScan}
                            disabled={isScanning}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                        />
                        <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-mono font-bold uppercase tracking-wider transition-all ${isScanning ? 'border-mlbb-neonBlue/60 bg-mlbb-neonBlue/10 text-mlbb-neonBlue' : 'border-white/[0.08] text-gray-500 hover:border-mlbb-neonBlue/40 hover:text-mlbb-neonBlue hover:bg-mlbb-neonBlue/5'}`}>
                            {isScanning ? <ScanLine className="w-4 h-4 animate-pulse" /> : <Upload className="w-4 h-4" />}
                            <span className="hidden sm:inline">{isScanning ? 'TARANIYOR...' : 'TARAMA'}</span>
                        </div>
                    </div>
                    {/* Camera — opens camera directly on mobile */}
                    {!isScanning && (
                        <div className="relative">
                            <input
                                id="ocr-camera"
                                type="file" accept="image/*" capture="environment"
                                onChange={handleImageScan}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/[0.08] text-gray-500 hover:border-mlbb-purple/40 hover:text-mlbb-purple hover:bg-mlbb-purple/5 text-sm font-mono font-bold uppercase tracking-wider transition-all">
                                <ScanLine className="w-4 h-4" />
                                <span className="hidden sm:inline">KAMERA</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

                {/* Alerts */}
                {scanSuccess && (
                    <div className="flex items-center gap-3 p-4 rounded-xl border border-mlbb-success/30 bg-mlbb-success/10 text-mlbb-success text-sm font-mono">
                        <ScanLine className="w-4 h-4 shrink-0" /> {scanSuccess}
                    </div>
                )}
                {scanError && (
                    <div className="flex flex-col gap-1.5 p-4 rounded-xl border border-mlbb-gold/30 bg-mlbb-gold/10 text-mlbb-gold text-sm">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="w-4 h-4 shrink-0" /> {scanError}
                        </div>
                        {scanDebug && (
                            <p className="text-[11px] font-mono text-mlbb-gold/60 break-all pl-7">{scanDebug}</p>
                        )}
                    </div>
                )}
                {submitError && (
                    <div className="flex items-center gap-3 p-4 rounded-xl border border-mlbb-danger/30 bg-mlbb-danger/10 text-mlbb-danger text-sm">
                        <AlertCircle className="w-4 h-4 shrink-0" /> {submitError}
                    </div>
                )}

                {/* ─── HERO SELECTION ─── */}
                <div className="card-glass rounded-2xl p-5 relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-mlbb-neonBlue/40 to-transparent" />
                    <p className="section-label flex items-center gap-2 mb-4">
                        <Shield className="w-3.5 h-3.5 text-mlbb-neonBlue" /> SAVAŞÇI SEÇİMİ
                    </p>
                    <div className="flex overflow-x-auto sm:grid sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1.5 pb-3 sm:pb-0 snap-x hide-scrollbar">
                        {heroes.map(hero => (
                            <div
                                key={hero.id}
                                onClick={() => setSelectedHeroId(hero.id)}
                                title={hero.name}
                                className={`relative flex-none w-16 sm:w-auto snap-center cursor-pointer aspect-square rounded-lg overflow-hidden border transition-all duration-200 group ${selectedHeroId === hero.id
                                    ? 'border-mlbb-neonBlue shadow-[0_0_10px_rgba(0,240,255,0.3)] ring-1 ring-mlbb-neonBlue/40'
                                    : 'border-white/[0.06] grayscale hover:grayscale-0 hover:border-white/20'
                                }`}
                            >
                                <ImageWithFallback src={hero.imagePath} alt={hero.name} fallbackText={hero.name.charAt(0)} className="w-full h-full object-cover" />
                                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                                    <p className="text-[8px] font-mono text-white/70 truncate text-center uppercase">{hero.name}</p>
                                </div>
                                {selectedHeroId === hero.id && (
                                    <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-mlbb-neonBlue shadow-[0_0_4px_rgba(0,240,255,1)]" />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* ── Build load indicator ── */}
                    {selectedHeroId && heroBuilds[selectedHeroId] && (
                        <p className="text-[11px] font-mono text-mlbb-purple/50 pt-2 mt-1 border-t border-white/[0.04]">
                            ↺ {getHeroById(selectedHeroId)?.name} varsayılan yapısı yüklendi
                        </p>
                    )}
                </div>

                {/* ─── KDA + RESULT ─── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    {/* KDA Inputs */}
                    <div className="card-glass rounded-2xl p-5">
                        <p className="section-label flex items-center gap-2 mb-4">
                            <Crosshair className="w-3.5 h-3.5 text-mlbb-neonBlue" /> {t('form_kda_stats')}
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { label: 'KILL', value: kills, setter: setKills, color: 'text-mlbb-neonBlue', border: 'border-mlbb-neonBlue/20' },
                                { label: 'DEATH', value: deaths, setter: setDeaths, color: 'text-mlbb-danger', border: 'border-mlbb-danger/20' },
                                { label: 'ASSIST', value: assists, setter: setAssists, color: 'text-mlbb-gold', border: 'border-mlbb-gold/20' },
                            ].map(({ label, value, setter, color, border }) => (
                                <div key={label} className={`rounded-xl border ${border} bg-black/30 p-3 text-center`}>
                                    <p className={`text-[10px] font-mono ${color} mb-1`}>{label}</p>
                                    <input
                                        type="number" min="0"
                                        value={value}
                                        onChange={e => setter(parseInt(e.target.value) || 0)}
                                        className={`w-full bg-transparent ${color} text-center text-2xl font-display font-bold outline-none`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Match Result Toggle */}
                    <div className="card-glass rounded-2xl p-5">
                        <p className="section-label flex items-center gap-2 mb-4">
                            <Goal className="w-3.5 h-3.5 text-mlbb-neonBlue" /> {t('form_match_result')}
                        </p>
                        <div className="grid grid-cols-2 gap-2 h-[calc(100%-2.5rem)]">
                            <button
                                type="button"
                                onClick={() => setResult('Victory')}
                                className={`rounded-xl border font-display font-bold text-sm tracking-widest uppercase transition-all duration-200 py-4 ${result === 'Victory'
                                    ? 'border-mlbb-neonBlue bg-mlbb-neonBlue/10 text-mlbb-neonBlue shadow-[inset_0_0_20px_rgba(0,240,255,0.1)]'
                                    : 'border-white/[0.06] text-gray-600 hover:text-gray-300 hover:border-white/20'
                                }`}
                            >
                                {t('form_btn_victory')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setResult('Defeat')}
                                className={`rounded-xl border font-display font-bold text-sm tracking-widest uppercase transition-all duration-200 py-4 ${result === 'Defeat'
                                    ? 'border-mlbb-danger bg-mlbb-danger/10 text-mlbb-danger shadow-[inset_0_0_20px_rgba(255,50,80,0.1)]'
                                    : 'border-white/[0.06] text-gray-600 hover:text-gray-300 hover:border-white/20'
                                }`}
                            >
                                {t('form_btn_defeat')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ─── BATTLE SPELL ─── */}
                <div className="card-glass rounded-2xl p-5">
                    <p className="section-label flex items-center gap-2 mb-4">
                        <Zap className="w-3.5 h-3.5 text-mlbb-gold" /> SAVAŞ BÜYÜSÜ
                    </p>
                    <div className="flex overflow-x-auto gap-2 pb-2 snap-x hide-scrollbar">
                        {spells.map(spell => (
                            <div
                                key={spell.id}
                                onClick={() => setSelectedSpellId(spell.id)}
                                title={spell.name}
                                className={`relative flex-none w-14 h-14 snap-center cursor-pointer rounded-xl border overflow-hidden transition-all duration-200 group ${selectedSpellId === spell.id
                                    ? 'border-mlbb-gold shadow-[0_0_10px_rgba(255,191,0,0.3)] ring-1 ring-mlbb-gold/40'
                                    : 'border-white/[0.06] grayscale hover:grayscale-0 hover:border-white/20'
                                }`}
                            >
                                <ImageWithFallback src={spell.iconUrl} alt={spell.name} className="w-full h-full object-cover" />
                                {selectedSpellId === spell.id && (
                                    <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-mlbb-gold shadow-[0_0_4px_rgba(255,191,0,1)]" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ─── EMBLEM TREE ─── */}
                <div className="card-glass rounded-2xl p-5 space-y-4">
                    <p className="section-label flex items-center gap-2">
                        <BrainCircuit className="w-3.5 h-3.5 text-mlbb-purple" /> {t('form_emblem_select')}
                    </p>

                    {/* ── Ana Amblem — icon row ── */}
                    <div>
                        <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-2">ANA AMBLEM</p>
                        <div className="flex flex-wrap gap-2">
                            {emblems.map(emb => (
                                <div
                                    key={emb.id}
                                    onClick={() => { setSelectedEmblemId(emb.id); setSelectedTier1Id(''); setSelectedTier2Id(''); setSelectedCoreId(''); }}
                                    title={emb.name}
                                    className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 cursor-pointer transition-all duration-200 ${
                                        selectedEmblemId === emb.id
                                            ? 'border-mlbb-purple shadow-[0_0_12px_rgba(124,58,237,0.4)] ring-1 ring-mlbb-purple/40'
                                            : 'border-white/[0.06] grayscale hover:grayscale-0 hover:border-mlbb-purple/30'
                                    }`}
                                >
                                    <ImageWithFallback
                                        src={emb.iconUrl} alt={emb.name}
                                        className="w-full h-full object-cover"
                                        fallbackText={emb.name.substring(0, 2)}
                                    />
                                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent px-0.5 pb-0.5">
                                        <p className="text-[7px] font-mono text-white/70 truncate text-center leading-tight">{emb.name.replace(' Amblemi', '')}</p>
                                    </div>
                                    {selectedEmblemId === emb.id && (
                                        <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-mlbb-purple shadow-[0_0_4px_rgba(124,58,237,1)]" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Tier 1 + Tier 2 talents — pill buttons ── */}
                    {selectedEmblemData && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <p className="text-[10px] font-mono text-mlbb-neonBlue/70 uppercase tracking-widest mb-2">1. KADEME YETENEĞİ</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {selectedEmblemData.tier1Talents?.map(talent => (
                                        <button
                                            key={talent.id}
                                            type="button"
                                            onClick={() => setSelectedTier1Id(talent.id)}
                                            title={talent.description}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                                                selectedTier1Id === talent.id
                                                    ? 'bg-mlbb-neonBlue/20 border-mlbb-neonBlue/50 text-mlbb-neonBlue'
                                                    : 'border-white/[0.08] text-gray-500 hover:border-mlbb-neonBlue/30 hover:text-gray-300'
                                            }`}
                                        >
                                            {talent.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-mono text-purple-400/70 uppercase tracking-widest mb-2">2. KADEME YETENEĞİ</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {selectedEmblemData.tier2Talents?.map(talent => (
                                        <button
                                            key={talent.id}
                                            type="button"
                                            onClick={() => setSelectedTier2Id(talent.id)}
                                            title={talent.description}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                                                selectedTier2Id === talent.id
                                                    ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                                                    : 'border-white/[0.08] text-gray-500 hover:border-purple-500/30 hover:text-gray-300'
                                            }`}
                                        >
                                            {talent.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Core Talent — shown when tier1 + tier2 selected ── */}
                    {selectedEmblemData && selectedTier1Id && selectedTier2Id && (
                        <div>
                            <p className="text-[10px] font-mono text-mlbb-gold/80 uppercase tracking-widest mb-2">ANA YETENEK (CORE) — 1 Seç</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                {selectedEmblemData.coreTalents?.map(talent => (
                                    <button
                                        key={talent.id}
                                        type="button"
                                        onClick={() => setSelectedCoreId(talent.id)}
                                        className={`flex flex-col items-start text-left p-3 rounded-xl border transition-all ${
                                            selectedCoreId === talent.id
                                                ? 'bg-mlbb-gold/10 border-mlbb-gold/50 shadow-[0_0_8px_rgba(255,191,0,0.15)]'
                                                : 'border-white/[0.06] hover:border-mlbb-gold/20 hover:bg-white/[0.02]'
                                        }`}
                                    >
                                        <div className="flex items-center gap-1.5 mb-1">
                                            {selectedCoreId === talent.id && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-mlbb-gold shrink-0" />
                                            )}
                                            <p className={`text-xs font-bold font-display ${selectedCoreId === talent.id ? 'text-mlbb-gold' : 'text-gray-400'}`}>
                                                {talent.name}
                                            </p>
                                        </div>
                                        <p className="text-[9px] font-mono text-gray-600 leading-relaxed line-clamp-2">{talent.description}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ─── ITEM BUILD ─── */}
                <div className="card-glass rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <p className="section-label flex items-center gap-2">
                            <Sword className="w-3.5 h-3.5 text-mlbb-gold" /> {t('form_item_build')}
                        </p>
                        <span className="text-xs font-mono text-gray-600">{selectedItems.length}/6 SLOT</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {[...Array(6)].map((_, index) => {
                            const itemId = selectedItems[index];
                            const item = itemId ? items.find(i => i.id === itemId) : null;
                            return (
                                <div key={index} className="w-14 h-14 flex-shrink-0 relative group">
                                    {item ? (
                                        <div className="w-full h-full rounded-xl border border-mlbb-gold/30 overflow-hidden cursor-pointer" onClick={() => removeItem(item.id)}>
                                            <ImageWithFallback src={item.iconUrl} alt={item.name} fallbackText={item.name.charAt(0)} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-mlbb-danger/70 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <X className="w-5 h-5 text-white" />
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => { if (selectedItems.length < 6) setIsItemModalOpen(!isItemModalOpen); }}
                                            className={`w-full h-full rounded-xl border-2 border-dashed flex items-center justify-center transition-all ${selectedItems.length < 6
                                                ? 'border-white/10 text-gray-700 hover:border-mlbb-neonBlue/40 hover:text-mlbb-neonBlue cursor-pointer'
                                                : 'border-white/5 text-gray-800 cursor-not-allowed'
                                            }`}
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Item Picker Panel */}
                    {isItemModalOpen && selectedItems.length < 6 && (
                        <div className="rounded-xl border border-white/[0.06] bg-black/40 p-4">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-[10px] font-mono text-mlbb-neonBlue uppercase tracking-widest">EŞYA SEÇ</p>
                                <button type="button" onClick={() => setIsItemModalOpen(false)} className="text-gray-600 hover:text-white transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1.5 max-h-48 overflow-y-auto pr-1">
                                {items.filter(i => !selectedItems.includes(i.id)).map(item => (
                                    <div
                                        key={item.id}
                                        onClick={() => addItem(item.id)}
                                        title={item.name}
                                        className="cursor-pointer aspect-square rounded-lg border border-white/[0.06] overflow-hidden hover:border-mlbb-neonBlue/40 hover:shadow-[0_0_8px_rgba(0,240,255,0.15)] transition-all opacity-70 hover:opacity-100"
                                    >
                                        <ImageWithFallback src={item.iconUrl} alt={item.name} fallbackText="IT" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ─── SUBMIT ─── */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-cyber w-full flex items-center justify-center gap-2 py-4 text-sm font-bold tracking-widest uppercase disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                >
                    {isSubmitting ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> İŞLENİYOR...</>
                    ) : (
                        <><BrainCircuit className="w-4 h-4" /> {t('form_submit')} — ORACLE ANALİZİ</>
                    )}
                </button>
            </form>
        </div>
    );
};
