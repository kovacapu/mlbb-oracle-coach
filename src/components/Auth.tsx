import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Sword, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

interface AuthProps {
    onAuthSuccess: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                onAuthSuccess();
            } else {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                alert('Kayıt başarılı! Lütfen giriş yapın.');
                setIsLogin(true);
            }
        } catch (err: unknown) {
            setError((err as Error).message || 'Kimlik doğrulama hatası');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
            {/* Aurora blobs */}
            <div className="absolute top-[10%] left-[10%] w-[60vw] h-[60vw] max-w-2xl rounded-full bg-mlbb-neonBlue/[0.06] blur-[120px] pointer-events-none animate-aurora-float" />
            <div className="absolute bottom-[10%] right-[10%] w-[50vw] h-[50vw] max-w-xl rounded-full bg-mlbb-purple/[0.08] blur-[100px] pointer-events-none animate-aurora-float-2" />
            <div className="absolute top-[50%] left-[50%] w-[30vw] h-[30vw] max-w-md rounded-full bg-mlbb-gold/[0.05] blur-[100px] pointer-events-none animate-aurora-float-3" />

            {/* Card */}
            <div className="relative w-full max-w-md aurora-border aurora-border-active animate-slide-up">
                <div className="card-glass rounded-2xl p-8 sm:p-10 relative overflow-hidden">

                    {/* Subtle inner grid */}
                    <div className="absolute inset-0 bg-grid opacity-50 rounded-2xl" />

                    {/* Top glow line */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-mlbb-neonBlue/60 to-transparent" />

                    <div className="relative z-10">
                        {/* Logo */}
                        <div className="flex flex-col items-center mb-10">
                            <div className="relative mb-4">
                                <div className="absolute inset-0 blur-xl bg-mlbb-neonBlue/30 rounded-full scale-150" />
                                <Sword className="relative w-12 h-12 text-mlbb-neonBlue animate-flicker" />
                            </div>
                            <h1 className="font-display font-black text-3xl tracking-widest uppercase gradient-text-cyber">
                                ML Coach
                            </h1>
                            <p className="text-gray-600 font-mono text-xs tracking-[0.3em] uppercase mt-2">
                                {isLogin ? 'SİSTEM GİRİŞİ' : 'YENİ KAYIT'}
                            </p>
                        </div>

                        <form onSubmit={handleAuth} className="space-y-4">
                            {/* Error */}
                            {error && (
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-mlbb-danger/10 border border-mlbb-danger/30 text-mlbb-danger text-sm">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    {error}
                                </div>
                            )}

                            {/* Email */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                    <Mail className="h-4 w-4 text-gray-600" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-cyber pl-10"
                                    placeholder="E-posta adresi"
                                />
                            </div>

                            {/* Password */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4 text-gray-600" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-cyber pl-10"
                                    placeholder="Şifre"
                                />
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-cyber w-full flex items-center justify-center gap-2 py-3 mt-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {isLogin ? 'GİRİŞ YAP' : 'KAYIT OL'}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/[0.06]" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="px-3 bg-mlbb-card text-gray-600 text-xs font-mono tracking-widest uppercase">veya</span>
                            </div>
                        </div>

                        {/* Google */}
                        <button
                            type="button"
                            onClick={async () => {
                                setLoading(true);
                                try {
                                    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
                                    if (error) throw error;
                                } catch (err: unknown) {
                                    setError((err as Error).message || 'Google ile giriş başarısız');
                                    setLoading(false);
                                }
                            }}
                            disabled={loading}
                            className="btn-ghost w-full flex items-center justify-center gap-3 py-3 disabled:opacity-50"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-1 7.28-2.69l-3.57-2.77c-.99.69-2.26 1.1-3.71 1.1-2.87 0-5.3-1.94-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google ile Giriş
                        </button>

                        {/* Toggle */}
                        <div className="mt-8 text-center">
                            <button
                                onClick={() => { setIsLogin(!isLogin); setError(null); }}
                                className="text-xs text-gray-500 hover:text-mlbb-neonBlue transition-colors font-mono tracking-wider"
                            >
                                {isLogin ? 'Hesabın yok mu? → Kayıt Ol' : 'Zaten kayıtlı mısın? → Giriş Yap'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
