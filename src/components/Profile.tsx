import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { User, Loader2, CheckCircle2, X } from 'lucide-react';
import { HEROES } from '../data/heroes';
import type { HeroRole } from '../data/heroes';
import { ImageWithFallback } from './ImageWithFallback';
import { motion, AnimatePresence } from 'framer-motion';

const ROLE_COLORS: Record<HeroRole, string> = {
    Fighter: 'border-orange-500/50 text-orange-400 bg-orange-500/10',
    Mage: 'border-mlbb-purple/50 text-mlbb-purpleLight bg-mlbb-purple/10',
    Marksman: 'border-mlbb-neonBlue/50 text-mlbb-neonBlue bg-mlbb-neonBlue/10',
    Assassin: 'border-mlbb-danger/50 text-mlbb-danger bg-mlbb-danger/10',
    Tank: 'border-mlbb-gold/50 text-mlbb-gold bg-mlbb-gold/10',
    Support: 'border-mlbb-success/50 text-mlbb-success bg-mlbb-success/10',
};

export const Profile: React.FC = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [nickname, setNickname] = useState('');
    const [mainRole, setMainRole] = useState<HeroRole>('Fighter');
    const [avatarHeroId, setAvatarHeroId] = useState('miya');
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

    const roles: HeroRole[] = ['Fighter', 'Mage', 'Marksman', 'Assassin', 'Tank', 'Support'];

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    const { data, error } = await supabase
                        .from('profiles').select('*').eq('user_id', session.user.id).single();
                    if (error && error.code !== 'PGRST116') throw error;
                    if (data) {
                        setNickname(data.nickname || '');
                        setMainRole(data.main_role || 'Fighter');
                        setAvatarHeroId(data.avatar_hero_id || 'miya');
                    }
                }
            } catch (err) {
                console.error("Error fetching profile:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) throw new Error('No user on the session!');
            const { error } = await supabase.from('profiles').upsert({
                user_id: session.user.id,
                nickname, main_role: mainRole, avatar_hero_id: avatarHeroId,
                updated_at: new Date()
            }, { onConflict: 'user_id' });
            if (error) throw error;
            setMessage(t('profile_saved_success'));
        } catch (err: any) {
            setMessage(err.message || "An error occurred");
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(''), 3000);
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

    const selectedHero = Object.values(HEROES).find(h => h.id === avatarHeroId);

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-12">

            {/* Header */}
            <div>
                <p className="section-label mb-1">KULLANICI SİSTEMİ</p>
                <h1 className="font-display font-black text-3xl gradient-text-cyber tracking-wider uppercase">
                    {t('profile_title')}
                </h1>
            </div>

            {/* Main Card */}
            <div className="aurora-border rounded-2xl">
                <div className="card-glass rounded-2xl p-6 sm:p-8 relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-mlbb-neonBlue/50 to-transparent" />

                    <form onSubmit={handleSave} className="space-y-8">

                        {/* Avatar + Info Row */}
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">

                            {/* Avatar */}
                            <div className="flex flex-col items-center gap-3 shrink-0">
                                <div
                                    className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-white/10 cursor-pointer group hover:border-mlbb-neonBlue transition-all duration-300 shadow-lg"
                                    onClick={() => setIsAvatarModalOpen(true)}
                                >
                                    {selectedHero ? (
                                        <ImageWithFallback
                                            src={selectedHero.imagePath}
                                            alt={selectedHero.name}
                                            className="w-full h-full object-cover transition-all group-hover:scale-105"
                                            fallbackText="AV"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <User className="w-10 h-10 text-gray-700" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-white text-xs font-bold font-mono uppercase tracking-widest">DEĞİŞTİR</span>
                                    </div>
                                </div>
                                <p className="section-label">{t('profile_avatar')}</p>
                            </div>

                            {/* Fields */}
                            <div className="flex-1 w-full space-y-6">
                                {/* Nickname */}
                                <div className="space-y-2">
                                    <label className="section-label block">{t('profile_nickname')}</label>
                                    <input
                                        type="text"
                                        value={nickname}
                                        onChange={(e) => setNickname(e.target.value)}
                                        className="input-cyber w-full"
                                        placeholder="NINJAKIRA99"
                                        maxLength={20}
                                        required
                                    />
                                </div>

                                {/* Main Role */}
                                <div className="space-y-2">
                                    <label className="section-label block">{t('profile_main_role')}</label>
                                    <div className="flex flex-wrap gap-2">
                                        {roles.map(role => (
                                            <button
                                                key={role}
                                                type="button"
                                                onClick={() => setMainRole(role)}
                                                className={`px-4 py-2 rounded-xl border font-mono text-xs font-bold uppercase tracking-widest transition-all duration-200 ${mainRole === role
                                                    ? ROLE_COLORS[role]
                                                    : 'border-white/[0.06] text-gray-600 hover:text-gray-300 hover:border-white/20'
                                                }`}
                                            >
                                                {t(`role_${role}`)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="h-6 flex items-center">
                                <AnimatePresence>
                                    {message && (
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            className="flex items-center gap-2 text-mlbb-success text-xs font-mono tracking-widest uppercase"
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                            {message}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <button
                                type="submit"
                                disabled={saving}
                                className="btn-cyber flex items-center gap-2 px-8 py-3 text-xs disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                            >
                                {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> İŞLENİYOR...</> : 'VERİLERİ GÜNCELLE'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Avatar Modal */}
            <AnimatePresence>
                {isAvatarModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={() => setIsAvatarModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 10 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 10 }}
                            className="card-glass rounded-2xl p-6 max-w-4xl w-full max-h-[85vh] flex flex-col relative"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-mlbb-neonBlue/60 to-transparent" />
                            <div className="flex justify-between items-center mb-5 pb-4 border-b border-white/[0.06]">
                                <p className="section-label">{t('profile_avatar')} SEÇİMİ</p>
                                <button
                                    type="button"
                                    onClick={() => setIsAvatarModalOpen(false)}
                                    className="text-gray-600 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="overflow-y-auto pr-1 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 flex-1">
                                {Object.values(HEROES).map(hero => (
                                    <div
                                        key={hero.id}
                                        onClick={() => { setAvatarHeroId(hero.id); setIsAvatarModalOpen(false); }}
                                        className={`cursor-pointer rounded-xl overflow-hidden border aspect-square transition-all duration-200 ${avatarHeroId === hero.id
                                            ? 'border-mlbb-neonBlue shadow-[0_0_10px_rgba(0,240,255,0.3)] ring-1 ring-mlbb-neonBlue/30'
                                            : 'border-white/[0.06] grayscale hover:grayscale-0 hover:border-white/20'
                                        }`}
                                    >
                                        <ImageWithFallback src={hero.imagePath} alt={hero.name} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
