import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    LayoutDashboard,
    Crosshair,
    BookOpen,
    Swords,
    Trophy,
    User,
    LogOut,
    Sword,
    Plus,
    Menu,
    X,
    BarChart2,
    Library,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

interface NavbarProps {
    session: Session | null;
    onLanguageChange: (lang: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ session, onLanguageChange }) => {
    const { t, i18n } = useTranslation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    const navItems = [
        { path: '/', label: t('nav_dashboard'), icon: <LayoutDashboard className="w-4 h-4" /> },
        { path: '/add-match', label: t('nav_add_match'), icon: <Plus className="w-4 h-4" /> },
        { path: '/draft', label: t('nav_drafter'), icon: <Crosshair className="w-4 h-4" /> },
        { path: '/heroes', label: t('nav_heroes'), icon: <BookOpen className="w-4 h-4" /> },
        { path: '/meta', label: 'Meta', icon: <Swords className="w-4 h-4" /> },
        { path: '/ansiklopedi', label: 'Ansiklopedi', icon: <Library className="w-4 h-4" /> },
        { path: '/hero-stats', label: 'Stats', icon: <BarChart2 className="w-4 h-4" /> },
        { path: '/leaderboard', label: t('nav_leaderboard'), icon: <Trophy className="w-4 h-4" /> },
        { path: '/profile', label: t('nav_profile'), icon: <User className="w-4 h-4" /> },
    ];

    return (
        <>
            {/* Main Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 h-16">
                {/* Glass background */}
                <div className="absolute inset-0 bg-black/70 backdrop-blur-2xl" />

                {/* Animated gradient border bottom */}
                <div
                    className="absolute bottom-0 left-0 right-0 h-[1px]"
                    style={{
                        background: 'linear-gradient(90deg, transparent 0%, #00f0ff 25%, #7c3aed 50%, #ffbf00 75%, transparent 100%)',
                        backgroundSize: '200% 100%',
                        animation: 'gradient-border 4s ease infinite',
                        opacity: 0.6,
                    }}
                />

                <div className="relative h-full max-w-screen-2xl mx-auto px-4 lg:px-8 flex items-center justify-between">
                    {/* Logo */}
                    <NavLink to="/" className="flex items-center gap-3 shrink-0">
                        <div className="relative">
                            <div className="absolute inset-0 blur-md bg-mlbb-neonBlue/40 rounded-full" />
                            <Sword className="relative w-7 h-7 text-mlbb-neonBlue animate-flicker" />
                        </div>
                        <span className="font-display font-black text-lg tracking-widest uppercase gradient-text-cyber hidden sm:block">
                            ML Coach
                        </span>
                    </NavLink>

                    {/* Desktop Nav Links */}
                    <div className="hidden lg:flex items-center gap-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === '/'}
                                className={({ isActive }) =>
                                    `nav-link ${isActive ? 'active' : ''}`
                                }
                            >
                                {item.icon}
                                {item.label}
                            </NavLink>
                        ))}
                    </div>

                    {/* Right Side Controls */}
                    <div className="flex items-center gap-3">
                        {/* Language Toggle */}
                        <div className="hidden sm:flex gap-1 bg-black/50 p-1 rounded-lg border border-white/[0.08]">
                            {['tr', 'en'].map((lang) => (
                                <button
                                    key={lang}
                                    onClick={() => onLanguageChange(lang)}
                                    className={`w-8 h-7 rounded-md text-xs font-bold uppercase transition-all duration-200 ${
                                        i18n.language === lang
                                            ? 'bg-gradient-to-r from-mlbb-neonBlue to-blue-600 text-black shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                                            : 'text-gray-500 hover:text-white'
                                    }`}
                                >
                                    {lang}
                                </button>
                            ))}
                        </div>

                        {/* Logout */}
                        {session && (
                            <button
                                onClick={handleLogout}
                                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/[0.08] text-gray-500 hover:text-mlbb-danger hover:border-mlbb-danger/30 transition-all text-xs font-semibold uppercase tracking-wide"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                <span className="hidden xl:block">{t('nav_logout')}</span>
                            </button>
                        )}

                        {/* Mobile hamburger */}
                        <button
                            className="lg:hidden p-2 rounded-lg border border-white/[0.08] text-gray-400 hover:text-white transition-colors"
                            onClick={() => setMobileOpen(!mobileOpen)}
                        >
                            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Drawer */}
            {mobileOpen && (
                <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setMobileOpen(false)}>
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <div
                        className="absolute top-16 left-0 right-0 bg-black/90 backdrop-blur-2xl border-b border-white/[0.06] p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col gap-1 mb-4">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.path === '/'}
                                    onClick={() => setMobileOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-display font-semibold text-sm tracking-wide uppercase ${
                                            isActive
                                                ? 'bg-mlbb-neonBlue/10 text-mlbb-neonBlue'
                                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`
                                    }
                                >
                                    {item.icon}
                                    {item.label}
                                </NavLink>
                            ))}
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                            <div className="flex gap-1 bg-black/50 p-1 rounded-lg border border-white/[0.08]">
                                {['tr', 'en'].map((lang) => (
                                    <button
                                        key={lang}
                                        onClick={() => onLanguageChange(lang)}
                                        className={`w-9 h-8 rounded-md text-xs font-bold uppercase transition-all ${
                                            i18n.language === lang
                                                ? 'bg-gradient-to-r from-mlbb-neonBlue to-blue-600 text-black'
                                                : 'text-gray-500 hover:text-white'
                                        }`}
                                    >
                                        {lang}
                                    </button>
                                ))}
                            </div>
                            {session && (
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/[0.08] text-gray-400 hover:text-mlbb-danger text-sm font-semibold uppercase tracking-wide transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    {t('nav_logout')}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
