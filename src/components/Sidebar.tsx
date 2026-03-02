import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    LayoutDashboard,
    Crosshair,
    BookOpen,
    Swords,
    Trophy,
    User,
    LogOut,
    Sword
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SidebarProps {
    session: any;
    onLanguageChange: (lang: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ session, onLanguageChange }) => {
    const { t, i18n } = useTranslation();
    const location = useLocation();

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    const navItems = [
        { path: '/', label: t('nav_dashboard'), icon: <LayoutDashboard className="w-5 h-5" /> },
        { path: '/draft', label: t('nav_drafter'), icon: <Crosshair className="w-5 h-5" /> },
        { path: '/heroes', label: t('nav_heroes'), icon: <BookOpen className="w-5 h-5" /> },
        { path: '/meta', label: 'Meta Tier', icon: <Swords className="w-5 h-5" /> },
        { path: '/leaderboard', label: t('nav_leaderboard'), icon: <Trophy className="w-5 h-5" /> },
        { path: '/profile', label: t('nav_profile'), icon: <User className="w-5 h-5" /> },
    ];

    return (
        <div className="w-20 lg:w-64 h-screen bg-mlbb-darker/95 backdrop-blur-3xl border-r border-white/5 flex flex-col transition-all duration-300 z-50 fixed left-0 top-0">
            {/* Logo Section */}
            <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-white/5">
                <Sword className="w-8 h-8 text-mlbb-neonBlue filter drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
                <h1 className="hidden lg:block ml-3 font-display font-black text-xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 uppercase">
                    MLBB <span className="text-mlbb-neonBlue text-glow-neon">AI</span>
                </h1>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 py-6 flex flex-col gap-2 px-3">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={`flex items-center justify-center lg:justify-start px-3 lg:px-4 py-3 rounded-xl transition-all duration-300 group relative
                                ${isActive
                                    ? 'bg-mlbb-neonBlue/10 text-mlbb-neonBlue border-l-2 border-mlbb-neonBlue shadow-[inset_4px_0_0_0_rgba(0,240,255,1)]'
                                    : 'text-gray-500 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
                                }`}
                            title={item.label}
                        >
                            <div className={`transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]' : 'group-hover:scale-110'}`}>
                                {item.icon}
                            </div>
                            <span className="hidden lg:block ml-4 text-sm font-bold tracking-wider uppercase">
                                {item.label}
                            </span>
                        </NavLink>
                    );
                })}
            </nav>

            {/* Bottom Section: Lang & User */}
            <div className="p-4 border-t border-white/5 space-y-4">
                <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-4">
                    {/* Language Toggles */}
                    <div className="flex gap-2 bg-black/50 p-1 rounded-lg border border-white/10">
                        <button
                            onClick={() => onLanguageChange('tr')}
                            className={`w-8 h-8 rounded text-xs font-bold transition-all ${i18n.language === 'tr' ? 'bg-mlbb-gold text-black shadow-[0_0_10px_rgba(255,191,0,0.5)]' : 'text-gray-500 hover:text-white'}`}
                        >
                            TR
                        </button>
                        <button
                            onClick={() => onLanguageChange('en')}
                            className={`w-8 h-8 rounded text-xs font-bold transition-all ${i18n.language === 'en' ? 'bg-mlbb-gold text-black shadow-[0_0_10px_rgba(255,191,0,0.5)]' : 'text-gray-500 hover:text-white'}`}
                        >
                            EN
                        </button>
                    </div>

                    {session && (
                        <button
                            onClick={handleLogout}
                            className="p-2 text-gray-500 hover:text-mlbb-danger transition-colors group relative"
                            title="Çıkış Yap"
                        >
                            <LogOut className="w-5 h-5 group-hover:drop-shadow-[0_0_8px_rgba(255,42,42,0.8)]" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
