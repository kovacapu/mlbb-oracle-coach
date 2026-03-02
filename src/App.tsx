import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from './lib/supabase';
import type { Session } from '@supabase/supabase-js';
import { MatchEntryForm } from './components/MatchEntryForm';
import { Dashboard } from './components/Dashboard';
import { PreMatchDrafter } from './components/PreMatchDrafter';
import { Auth } from './components/Auth';
import { HeroCodex } from './components/HeroCodex';
import { Profile } from './components/Profile';
import { Leaderboard } from './components/Leaderboard';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MetaTierList } from './components/MetaTierList';
import { HeroStats } from './components/HeroStats';
import { Ansiklopedi } from './components/Ansiklopedi';
import { Navbar } from './components/Navbar';

const AnimatedRoutes = () => {
  const location = useLocation();
  const pageVariants = {
    initial: { opacity: 0, y: 20, scale: 0.97 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -10, scale: 0.98 }
  };
  const pageTransition = {
    type: "tween" as const, ease: "easeInOut" as const, duration: 0.35
  };

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}><Dashboard /></motion.div>} />
        <Route path="/add-match" element={<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}><MatchEntryForm /></motion.div>} />
        <Route path="/draft" element={<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}><PreMatchDrafter /></motion.div>} />
        <Route path="/heroes" element={<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}><HeroCodex /></motion.div>} />
        <Route path="/profile" element={<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}><Profile /></motion.div>} />
        <Route path="/leaderboard" element={<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}><Leaderboard /></motion.div>} />
        <Route path="/meta" element={<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}><MetaTierList /></motion.div>} />
        <Route path="/hero-stats" element={<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}><HeroStats /></motion.div>} />
        <Route path="/ansiklopedi" element={<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}><Ansiklopedi /></motion.div>} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const { i18n } = useTranslation();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-mlbb-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-mlbb-neonBlue border-t-transparent animate-spin" />
          <span className="text-gray-500 font-display text-sm tracking-widest uppercase">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      {/* Scanline texture overlay */}
      <div className="scanline-overlay" />

      <div className="min-h-screen bg-mlbb-dark text-gray-100 font-sans selection:bg-mlbb-neonBlue/30 selection:text-white relative overflow-x-hidden">

        {/* Aurora Background Blobs */}
        <div className="fixed top-[10%] left-[5%] w-[50vw] h-[50vw] max-w-2xl max-h-2xl rounded-full bg-mlbb-neonBlue/[0.07] blur-[100px] pointer-events-none z-0 animate-aurora-float" />
        <div className="fixed top-[40%] right-[5%] w-[40vw] h-[40vw] max-w-xl max-h-xl rounded-full bg-mlbb-purple/[0.08] blur-[100px] pointer-events-none z-0 animate-aurora-float-2" />
        <div className="fixed bottom-[5%] left-[30%] w-[45vw] h-[45vw] max-w-2xl max-h-2xl rounded-full bg-mlbb-gold/[0.05] blur-[120px] pointer-events-none z-0 animate-aurora-float-3" />

        {/* Cyber grid bg */}
        <div className="fixed inset-0 bg-grid opacity-100 pointer-events-none z-0" />

        {session ? (
          <>
            <Navbar session={session} onLanguageChange={(lang) => i18n.changeLanguage(lang)} />
            <main className="relative z-10 pt-16 min-h-screen">
              <div className="max-w-screen-xl mx-auto px-4 lg:px-8 py-8">
                <AnimatedRoutes />
              </div>
            </main>
          </>
        ) : (
          <Auth onAuthSuccess={() => supabase.auth.getSession().then(({ data: { session } }) => setSession(session))} />
        )}

      </div>
    </Router>
  );
}

export default App;
