
import React, { useState, useEffect, useCallback } from 'react';
import { Transaction, SpendingInsight, UserProfile, ViewState, Theme } from './types';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { Analytics } from './components/Analytics';
import { getFinancialInsights } from './services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_AVATARS = [
  'https://i.pravatar.cc/150?u=a',
  'https://i.pravatar.cc/150?u=b',
  'https://i.pravatar.cc/150?u=c',
  'https://i.pravatar.cc/150?u=d',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka'
];

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('auth');
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('st_theme') as Theme) || 'dark';
  });
  
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('st_profile_v1');
    return saved ? JSON.parse(saved) : { 
      name: '', 
      monthlyIncome: 0, 
      housingStatus: 'rented', 
      baselineRent: 0,
      baselineGroceries: 0,
      baselineUtilities: 0,
      setupComplete: false,
      isAuthenticated: false,
      picture: MOCK_AVATARS[0]
    };
  });

  const [onboardingStep, setOnboardingStep] = useState(1);
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('st_tx_v1');
    return saved ? JSON.parse(saved) : [];
  });

  const [insight, setInsight] = useState<SpendingInsight | null>(null);
  const [isInsightLoading, setIsInsightLoading] = useState(false);

  const totalSpent = transactions.reduce((acc, t) => acc + t.amount, 0);

  const addTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const transaction: Transaction = {
      ...newTx,
      id: Math.random().toString(36).substring(2, 11) + Date.now().toString(36),
    };
    setTransactions(prev => [transaction, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    const html = document.documentElement;
    html.className = theme;
    localStorage.setItem('st_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('st_profile_v1', JSON.stringify(profile));
    if (profile.isAuthenticated) {
      if (profile.setupComplete && view === 'auth') setView('dashboard');
      else if (!profile.setupComplete && view === 'auth') setView('onboarding');
    }
  }, [profile, view]);

  useEffect(() => {
    localStorage.setItem('st_tx_v1', JSON.stringify(transactions));
  }, [transactions]);

  const fetchInsights = useCallback(async () => {
    if (!profile.setupComplete || transactions.length === 0) return;
    setIsInsightLoading(true);
    try {
      const result = await getFinancialInsights(transactions, profile);
      setInsight(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsInsightLoading(false);
    }
  }, [transactions, profile]);

  useEffect(() => {
    if (view === 'dashboard') fetchInsights();
  }, [view, fetchInsights]);

  const handleLogin = () => {
    setProfile(prev => ({
      ...prev,
      name: 'Aditya Kumar',
      email: 'aditya.k@gmail.com',
      isAuthenticated: true
    }));
    setView('landing');
  };

  const handleLogout = () => {
    if(confirm("Sign out and clear secure session?")) {
      setProfile({
        name: '', 
        monthlyIncome: 0, 
        housingStatus: 'rented', 
        baselineRent: 0,
        baselineGroceries: 0,
        baselineUtilities: 0,
        setupComplete: false,
        isAuthenticated: false,
        picture: MOCK_AVATARS[0]
      });
      setView('auth');
    }
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  // --- VIEWS ---

  if (view === 'auth') {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-white dark:bg-black transition-colors">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-12 rounded-[3.5rem] w-full max-w-md text-center"
        >
          <div className="w-20 h-20 gold-gradient rounded-3xl mx-auto flex items-center justify-center text-black font-black text-3xl mb-8 shadow-2xl">ST</div>
          <h1 className="text-3xl font-black tracking-tighter uppercase gold-text-gradient italic mb-2">SmartTrack</h1>
          <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-[0.3em] mb-12">Secure Cloud Intelligence</p>
          
          <button 
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-4 py-5 bg-white border border-neutral-200 dark:border-white/10 dark:bg-neutral-900 rounded-3xl text-sm font-bold shadow-xl hover:scale-[1.02] transition-transform text-black dark:text-white"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>
        </motion.div>
      </div>
    );
  }

  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center p-8 transition-colors">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center relative z-10">
          <div className="w-24 h-24 gold-gradient rounded-3xl mx-auto flex items-center justify-center text-black font-black text-4xl mb-12 shadow-2xl">ST</div>
          <h1 className="text-6xl font-black italic gold-text-gradient tracking-tighter uppercase mb-4">SmartTrack Pro</h1>
          <p className="text-neutral-500 font-black uppercase tracking-[0.5em] text-xs mb-16">System Ready for {profile.name}</p>
          <button onClick={() => setView(profile.setupComplete ? 'dashboard' : 'onboarding')} className="px-16 py-6 bg-black text-white dark:bg-white dark:text-black font-black uppercase tracking-widest text-sm rounded-full shadow-2xl hover:bg-amber-500 transition-colors">Initialize</button>
        </motion.div>
      </div>
    );
  }

  if (view === 'onboarding') {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-8 transition-colors">
        <motion.div layout className="glass p-12 rounded-[4rem] w-full max-w-2xl">
          <div className="flex gap-2 mb-10">
            {[1, 2, 3].map(step => (
              <div key={step} className={`h-1 flex-1 rounded-full transition-colors ${onboardingStep >= step ? 'bg-amber-500' : 'bg-neutral-200 dark:bg-neutral-800'}`}></div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {onboardingStep === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-3xl font-black gold-text-gradient uppercase mb-8">Identity Matrix</h2>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Legal Name Identifier</label>
                  <input type="text" className="w-full bg-neutral-100 dark:bg-black border border-neutral-200 dark:border-neutral-800 p-5 rounded-2xl outline-none text-black dark:text-white font-bold" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} placeholder="Aditya Kumar" />
                  <button disabled={!profile.name} onClick={() => setOnboardingStep(2)} className="w-full py-6 gold-gradient text-black font-black uppercase rounded-3xl mt-8 disabled:opacity-30">Next Phase</button>
                </div>
              </motion.div>
            )}

            {onboardingStep === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-3xl font-black gold-text-gradient uppercase mb-8">Economic Foundation</h2>
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-2">Monthly Yield (₹)</label>
                    <input type="number" className="w-full bg-neutral-100 dark:bg-black border border-neutral-200 dark:border-neutral-800 p-5 rounded-2xl outline-none text-black dark:text-white font-mono text-xl font-black" value={profile.monthlyIncome || ''} onChange={e => setProfile({...profile, monthlyIncome: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-2">Housing Protocol</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => setProfile({...profile, housingStatus: 'rented'})} className={`p-5 rounded-2xl font-black uppercase text-[10px] border transition-all ${profile.housingStatus === 'rented' ? 'bg-amber-600 border-amber-600 text-black' : 'bg-transparent border-neutral-200 dark:border-neutral-800 text-neutral-400'}`}>Rented</button>
                      <button onClick={() => setProfile({...profile, housingStatus: 'owned'})} className={`p-5 rounded-2xl font-black uppercase text-[10px] border transition-all ${profile.housingStatus === 'owned' ? 'bg-amber-600 border-amber-600 text-black' : 'bg-transparent border-neutral-200 dark:border-neutral-800 text-neutral-400'}`}>Owned</button>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-8">
                    <button onClick={() => setOnboardingStep(1)} className="flex-1 py-6 bg-neutral-200 dark:bg-neutral-900 text-neutral-600 font-black uppercase rounded-3xl">Back</button>
                    <button disabled={!profile.monthlyIncome} onClick={() => setOnboardingStep(3)} className="flex-1 py-6 gold-gradient text-black font-black uppercase rounded-3xl">Next Phase</button>
                  </div>
                </div>
              </motion.div>
            )}

            {onboardingStep === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-3xl font-black gold-text-gradient uppercase mb-8">Tactical Targets</h2>
                <div className="space-y-4">
                   <p className="text-[10px] text-neutral-500 font-bold uppercase mb-6 italic">Define expected monthly costs for AI calibration.</p>
                   <div>
                    <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block mb-1">Rent / EMI Baseline (₹)</label>
                    <input type="number" className="w-full bg-neutral-100 dark:bg-black border border-neutral-200 dark:border-neutral-800 p-4 rounded-xl text-black dark:text-white font-mono" value={profile.baselineRent || ''} onChange={e => setProfile({...profile, baselineRent: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block mb-1">Groceries Baseline (₹)</label>
                    <input type="number" className="w-full bg-neutral-100 dark:bg-black border border-neutral-200 dark:border-neutral-800 p-4 rounded-xl text-black dark:text-white font-mono" value={profile.baselineGroceries || ''} onChange={e => setProfile({...profile, baselineGroceries: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block mb-1">Utilities Baseline (₹)</label>
                    <input type="number" className="w-full bg-neutral-100 dark:bg-black border border-neutral-200 dark:border-neutral-800 p-4 rounded-xl text-black dark:text-white font-mono" value={profile.baselineUtilities || ''} onChange={e => setProfile({...profile, baselineUtilities: Number(e.target.value)})} />
                  </div>
                  <div className="flex gap-4 mt-8">
                    <button onClick={() => setOnboardingStep(2)} className="flex-1 py-6 bg-neutral-200 dark:bg-neutral-900 text-neutral-600 font-black uppercase rounded-3xl">Back</button>
                    <button onClick={() => { setProfile({...profile, setupComplete: true}); setView('dashboard'); }} className="flex-1 py-6 gold-gradient text-black font-black uppercase rounded-3xl">Complete Calibration</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  if (view === 'profile') {
    return (
      <div className="min-h-screen bg-white dark:bg-black p-8 transition-colors">
        <header className="max-w-4xl mx-auto flex justify-between items-center mb-16">
          <button onClick={() => setView('dashboard')} className="flex items-center gap-3 text-neutral-500 font-black uppercase text-[10px] hover:text-amber-500 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
            Return to Core
          </button>
          <h2 className="text-xl font-black italic gold-text-gradient uppercase">Identity Matrix</h2>
        </header>

        <main className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-1 space-y-8">
            <div className="relative group">
              <img src={profile.picture} className="w-full aspect-square rounded-[3rem] object-cover border-4 border-amber-500 shadow-2xl" alt="Avatar" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-[3rem] flex items-center justify-center">
                <p className="text-white font-black uppercase text-[10px] tracking-widest">Agent Active</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {MOCK_AVATARS.map((url, i) => (
                <button key={i} onClick={() => setProfile({...profile, picture: url})} className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${profile.picture === url ? 'border-amber-500 scale-105' : 'border-transparent opacity-40 hover:opacity-100'}`}>
                  <img src={url} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 glass p-10 rounded-[4rem] space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Public Identifier</label>
              <input type="text" className="w-full bg-neutral-100 dark:bg-black border border-neutral-200 dark:border-neutral-800 p-5 rounded-2xl outline-none text-black dark:text-white font-bold" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Custom Avatar URL</label>
              <input type="text" className="w-full bg-neutral-100 dark:bg-black border border-neutral-200 dark:border-neutral-800 p-5 rounded-2xl outline-none text-black dark:text-white text-xs font-mono" value={profile.picture} onChange={e => setProfile({...profile, picture: e.target.value})} placeholder="https://..." />
            </div>
            <div className="pt-8 border-t border-black/5 dark:border-white/5 space-y-4">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-neutral-400">
                <span>Cloud Status</span>
                <span className="text-green-500 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Encrypted</span>
              </div>
              <p className="text-[11px] text-neutral-500 leading-relaxed italic">Your identity is cryptographically linked to your local instance and synchronized with secure cloud relay {profile.email}.</p>
            </div>
            <button onClick={() => setView('dashboard')} className="w-full py-5 gold-gradient text-black font-black uppercase rounded-2xl shadow-xl hover:scale-[1.02] transition-transform">Commit Changes</button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors">
      <header className="border-b border-black/5 dark:border-white/5 bg-white/80 dark:bg-black/80 backdrop-blur-3xl sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-8 h-24 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 gold-gradient rounded-2xl flex items-center justify-center text-black font-black text-2xl">ST</div>
            <div>
              <h1 className="text-xl font-black italic gold-text-gradient leading-none">SmartTrack</h1>
              <p className="text-[9px] text-neutral-400 font-black uppercase tracking-[0.4em] mt-1">{profile.email}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-3 bg-neutral-100 dark:bg-neutral-900 border border-black/5 dark:border-white/5 rounded-full text-neutral-500 hover:text-amber-500 transition-all">
              {theme === 'dark' ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>}
            </button>
            <div className="flex items-center gap-4 pl-4 border-l border-black/5 dark:border-white/5">
               <button onClick={() => setView('profile')} className="relative group">
                 <img src={profile.picture} className="w-10 h-10 rounded-full border-2 border-amber-500 shadow-lg group-hover:scale-110 transition-transform" alt="Profile" />
               </button>
               <button onClick={handleLogout} className="text-[9px] font-black uppercase tracking-widest text-neutral-400 hover:text-red-500 transition-colors">Sign Out</button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div whileHover={{ y: -5 }} className="glass p-10 rounded-[3.5rem] bg-white/50 dark:bg-white/5">
                <span className="text-amber-600/60 text-[10px] font-black uppercase tracking-[0.3em] mb-3 block">Utilization</span>
                <p className="text-5xl font-black tracking-tighter mb-4 text-black dark:text-white">₹{totalSpent.toLocaleString('en-IN')}</p>
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">{((totalSpent/profile.monthlyIncome)*100).toFixed(1)}% of Yield</p>
              </motion.div>
              <motion.div whileHover={{ y: -5 }} className="glass p-10 rounded-[3.5rem] flex flex-col justify-between bg-white/50 dark:bg-white/5">
                <div>
                  <span className="text-neutral-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2 block">System Resilience</span>
                  <div className="h-2 w-full bg-neutral-200 dark:bg-black rounded-full mt-8 overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: insight ? `${insight.budgetAdherence}%` : '50%' }} className="h-full bg-amber-600"></motion.div></div>
                </div>
                <p className="text-lg font-black italic gold-text-gradient mt-6">Safety Score: {insight?.budgetAdherence || 0}%</p>
              </motion.div>
            </div>
            <div className="glass p-10 rounded-[4rem] border border-black/5 dark:border-white/5 shadow-2xl transition-colors">
              <div className="flex items-center gap-5 mb-10"><div className="w-14 h-14 bg-amber-600 rounded-2xl flex items-center justify-center text-black"><svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg></div><div><h2 className="text-2xl font-black italic gold-text-gradient uppercase">Strategic Feedback</h2><p className="text-[10px] text-neutral-400 font-black uppercase tracking-[0.3em]">Synched with Cloud Records</p></div></div>
              {isInsightLoading ? <div className="space-y-6 animate-pulse"><div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded-full w-full"></div><div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded-full w-2/3"></div></div> : insight ? <div className="space-y-10"><p className="text-neutral-500 dark:text-neutral-400 leading-relaxed text-sm font-medium italic border-l-4 border-amber-600 pl-6 py-2">{insight.summary}</p><div className="grid grid-cols-1 md:grid-cols-2 gap-10"><div className="p-8 bg-neutral-50 dark:bg-black/40 rounded-[3rem] border border-amber-900/10"><span className="text-amber-500 font-black text-[10px] uppercase tracking-[0.3em] mb-5 block">Opportunities</span><p className="text-sm text-neutral-700 dark:text-neutral-100 font-black leading-relaxed">{insight.savingOpportunities}</p></div><div className="space-y-4">{insight.recommendations.map((rec, i) => (<div key={i} className="flex gap-4 text-xs text-neutral-500 dark:text-neutral-400 items-start"><span className="w-5 h-5 rounded bg-amber-600 text-black flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">{i+1}</span><span className="font-bold leading-relaxed">{rec}</span></div>))}</div></div></div> : <p className="text-center py-12 text-neutral-300 dark:text-neutral-800 font-black uppercase tracking-widest italic opacity-50">Log transactions to reveal analysis</p>}
            </div>
            <div className="space-y-12"><Analytics transactions={transactions} /><TransactionList transactions={transactions} onDelete={deleteTransaction} /></div>
          </div>
          <div className="lg:col-span-4"><div className="sticky top-36"><TransactionForm onAdd={addTransaction} /></div></div>
        </div>
      </main>
    </div>
  );
};

export default App;
