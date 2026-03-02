/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                mlbb: {
                    // Dark Base Line
                    dark: '#07070f',
                    darker: '#04040a',
                    card: '#0c0c18',

                    // Cyber Palette
                    gold: '#ffbf00',
                    goldLight: '#ffd659',
                    neonBlue: '#00f0ff',
                    neonBlueDark: '#009ca6',
                    purple: '#7c3aed',
                    purpleLight: '#a78bfa',

                    // Industrial Danger
                    danger: '#ff2a2a',
                    success: '#00ff88',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Outfit', 'system-ui', 'sans-serif'],
            },
            backgroundImage: {
                'cyber-grid': "linear-gradient(rgba(0,240,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.03) 1px, transparent 1px)",
                'aurora-1': "radial-gradient(ellipse at 20% 50%, rgba(0,240,255,0.15) 0%, transparent 60%)",
                'aurora-2': "radial-gradient(ellipse at 80% 20%, rgba(124,58,237,0.15) 0%, transparent 60%)",
                'aurora-3': "radial-gradient(ellipse at 50% 80%, rgba(255,191,0,0.1) 0%, transparent 60%)",
            },
            animation: {
                'aurora-float': 'aurora-float 10s ease-in-out infinite',
                'aurora-float-2': 'aurora-float 14s ease-in-out infinite reverse',
                'aurora-float-3': 'aurora-float 18s ease-in-out infinite',
                'gradient-border': 'gradient-border 4s linear infinite',
                'scanline': 'scanline 10s linear infinite',
                'fade-in': 'fade-in 0.6s ease-out forwards',
                'slide-up': 'slide-up 0.5s ease-out forwards',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'flicker': 'flicker 4s ease-in-out infinite',
                'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
            },
            keyframes: {
                'aurora-float': {
                    '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
                    '33%': { transform: 'translate(40px, -60px) scale(1.15)' },
                    '66%': { transform: 'translate(-30px, 30px) scale(0.9)' },
                },
                'gradient-border': {
                    '0%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                    '100%': { backgroundPosition: '0% 50%' },
                },
                'scanline': {
                    '0%': { transform: 'translateY(-100vh)' },
                    '100%': { transform: 'translateY(200vh)' },
                },
                'fade-in': {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'slide-up': {
                    '0%': { opacity: '0', transform: 'translateY(30px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'flicker': {
                    '0%, 95%, 100%': { opacity: '1' },
                    '96%': { opacity: '0.6' },
                    '97%': { opacity: '1' },
                    '98%': { opacity: '0.8' },
                    '99%': { opacity: '1' },
                },
                'glow-pulse': {
                    '0%, 100%': { boxShadow: '0 0 10px rgba(0,240,255,0.4)' },
                    '50%': { boxShadow: '0 0 25px rgba(0,240,255,0.8), 0 0 50px rgba(0,240,255,0.3)' },
                },
            },
        },
    },
    plugins: [],
}
