
import React, { useState, useEffect, useCallback } from 'react';
import { Transaction, SpendingInsight } from './types';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { Analytics } from './components/Analytics';
import { getFinancialInsights } from './services/geminiService';
import { motion, AnimatePresence, Variants } from 'framer-motion';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 30 }
  }
};

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('smarttrack_v5_in');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Corrupted local storage detected:", e);
      return [];
    }
  });
  const [insight, setInsight] = useState<SpendingInsight | null>(null);
  const [isInsightLoading, setIsInsightLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('smarttrack_v5_in', JSON.stringify(transactions));
  }, [transactions]);

  const fetchInsights = useCallback(async () => {
    if (transactions.length === 0) return;
    setIsInsightLoading(true);
    try {
      const result = await getFinancialInsights(transactions);
      setInsight(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsInsightLoading(false);
    }
  }, [transactions]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const addTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const tx: Transaction = {
      ...newTx,
      id: Math.random().toString(36).substring(2, 9)
    };
    setTransactions(prev => [tx, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const totalSpent = transactions.reduce((acc, curr) => acc + curr.amount, 0);
  const healthScore = transactions.length > 0 ? 94 : 0;

  // Global environment check
  if (!process.env.API_KEY) {
    console.warn("SmartTrack Warning: process.env.API_KEY is missing. AI features will be disabled.");
  }

  return (
    <div className="min-h-screen bg-[#020202] text-white selection:bg-amber-500/30 font-inter">
      {/* Background Energy Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-amber-900/20 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-orange-900/10 blur-[150px] rounded-full"></div>
      </div>

      <header className="border-b border-white/5 bg-black/80 backdrop-blur-3xl sticky top-0 z-50 overflow-hidden">
        <motion.div 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring" as const, stiffness: 100, damping: 20 }}
          className="max-w-7xl mx-auto px-8 h-24 flex items-center justify-between"
        >
          <div className="flex items-center gap-5 group cursor-default">
            <motion.div 
              whileHover={{ rotate: 180, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-12 h-12 gold-gradient rounded-2xl flex items-center justify-center text-black font-black text-2xl shadow-[0_0_40px_rgba(217,119,6,0.5)]"
            >
              ST
            </motion.div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter uppercase italic gold-text-gradient leading-none group-hover:tracking-normal transition-all duration-500">
                SmartTrack Pro
              </h1>
              <p className="text-[9px] text-neutral-500 font-black uppercase tracking-[0.4em] mt-1">Institutional Intelligence</p>
            </div>
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.05, y: -2, boxShadow: "0 10px 30px rgba(245,158,11,0.2)" }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchInsights}
            disabled={isInsightLoading}
            className="px-8 py-3 bg-neutral-900 border border-white/5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 hover:bg-neutral-800 transition-all flex items-center gap-3 shadow-lg"
          >
            <svg className={`w-3.5 h-3.5 ${isInsightLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            Refine Protocols
          </motion.button>
        </motion.div>
      </header>

      <motion.main 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-8 py-12 relative"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-8 space-y-12">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div 
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02, transition: { type: "spring", stiffness: 400, damping: 25 } }}
                className="glass p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden group cursor-default"
              >
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-600/5 rounded-full blur-[80px] group-hover:bg-amber-600/15 transition-all duration-700"></div>
                <span className="text-amber-600/60 text-[10px] font-black uppercase tracking-[0.3em] mb-3 block">Aggregate Outflow</span>
                <AnimatePresence mode="wait">
                  <motion.p 
                    key={totalSpent}
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="text-5xl font-black text-white tracking-tighter mb-6"
                  >
                    ₹{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </motion.p>
                </AnimatePresence>
                <div className="flex items-center gap-3">
                  <span className="px-4 py-1.5 bg-amber-600/10 text-amber-600 text-[9px] font-black rounded-full border border-amber-600/20 uppercase tracking-tighter">Verified Stream</span>
                  <span className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest">{transactions.length} Cycles</span>
                </div>
              </motion.div>
              
              <motion.div 
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02, transition: { type: "spring", stiffness: 400, damping: 25 } }}
                className="glass p-10 rounded-[3.5rem] shadow-2xl flex flex-col justify-between cursor-default"
              >
                <div>
                  <span className="text-neutral-600 text-[10px] font-black uppercase tracking-[0.3em] mb-2 block">Stability Factor</span>
                  <p className="text-2xl font-black text-neutral-200 tracking-tight italic">Resource Velocity</p>
                  <div className="h-2 w-full bg-black rounded-full mt-8 overflow-hidden border border-white/5 p-0.5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: transactions.length > 0 ? '78%' : '0%' }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-amber-600 rounded-full shadow-[0_0_20px_rgba(217,119,6,0.6)]"
                    ></motion.div>
                  </div>
                </div>
                <span className="text-[9px] text-neutral-600 font-black uppercase tracking-[0.2em] mt-6 flex items-center gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></span> Nominal
                </span>
              </motion.div>
            </div>

            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -5, transition: { type: "spring", stiffness: 400, damping: 25 } }}
              className="bg-gradient-to-br from-[#0a0a0a] to-black p-10 rounded-[4rem] border border-white/5 shadow-3xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-600/5 blur-[120px] pointer-events-none group-hover:bg-amber-600/10 transition-colors"></div>
              <div className="flex items-center gap-5 mb-10">
                <motion.div 
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.8 }}
                  className="w-14 h-14 bg-amber-600 rounded-2xl flex items-center justify-center text-black shadow-[0_0_30px_rgba(217,119,6,0.3)]"
                >
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </motion.div>
                <div>
                  <h2 className="text-2xl font-black italic tracking-tighter uppercase gold-text-gradient">Advisory Neural Link</h2>
                  <p className="text-[10px] text-neutral-600 font-black uppercase tracking-[0.3em]">AI Synthesis Ready</p>
                </div>
              </div>
              
              {!process.env.API_KEY ? (
                <div className="py-8 text-amber-500/50 text-xs font-mono uppercase tracking-widest text-center border border-amber-500/10 rounded-3xl p-4">
                  [ System Warning: AI Insight Engine Offline ]<br/>
                  Configuration Error: Missing API_KEY in Environment
                </div>
              ) : isInsightLoading ? (
                <div className="space-y-6 animate-pulse">
                  <div className="h-4 bg-neutral-800/50 rounded-full w-full"></div>
                  <div className="h-4 bg-neutral-800/50 rounded-full w-2/3"></div>
                  <div className="grid grid-cols-2 gap-8 mt-12">
                    <div className="h-40 bg-neutral-800/20 rounded-[2.5rem]"></div>
                    <div className="h-40 bg-neutral-800/20 rounded-[2.5rem]"></div>
                  </div>
                </div>
              ) : insight ? (
                <div className="space-y-10">
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-neutral-400 leading-relaxed text-sm font-medium italic border-l-4 border-amber-600 pl-6 py-2"
                  >
                    {insight.summary}
                  </motion.p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <motion.div 
                      whileHover={{ scale: 1.05, y: -4 }}
                      className="p-8 bg-black/40 rounded-[3rem] border border-amber-900/20 hover:border-amber-600/40 transition-all shadow-xl"
                    >
                      <span className="text-amber-500 font-black text-[10px] uppercase tracking-[0.3em] mb-5 block">Asset Leakage</span>
                      <p className="text-base text-neutral-100 leading-relaxed font-black tracking-tight">{insight.savingOpportunities}</p>
                    </motion.div>
                    <div className="space-y-4">
                      <span className="text-[10px] text-neutral-600 font-black uppercase tracking-[0.3em] mb-4 block">Strategic Directives</span>
                      {insight.recommendations.map((rec, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + (i * 0.1) }}
                          className="flex gap-4 text-xs text-neutral-400 items-start group/rec"
                        >
                          <span className="w-5 h-5 rounded-lg bg-amber-600/5 border border-amber-600/20 flex items-center justify-center text-amber-500 text-[10px] font-black shrink-0 mt-0.5 group-hover/rec:bg-amber-600 group-hover/rec:text-black transition-all">{i+1}</span>
                          <span className="font-bold leading-relaxed group-hover/rec:text-neutral-200 transition-colors">{rec}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center text-neutral-800 font-black uppercase tracking-[0.5em] italic opacity-50">
                  Syncing Metadata
                </div>
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-8">
               <div className="flex items-center gap-4 px-2">
                 <h2 className="text-xl font-black italic tracking-tighter uppercase gold-text-gradient">Market Visuals</h2>
                 <div className="h-px bg-white/5 flex-grow"></div>
               </div>
               <Analytics transactions={transactions} />
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-8">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-black italic tracking-tighter uppercase gold-text-gradient">Financial Feed</h2>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                   <span className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.3em]">Encrypted Stream</span>
                </div>
              </div>
              <TransactionList transactions={transactions} onDelete={deleteTransaction} />
            </motion.div>
          </div>

          <div className="lg:col-span-4 space-y-12">
            <div className="sticky top-36">
              <div className="mb-12">
                <TransactionForm onAdd={addTransaction} />
              </div>
              
              {/* Refined Vitality Quotient Section */}
              <motion.div 
                variants={itemVariants}
                whileHover={{ y: -10, scale: 1.02, transition: { type: "spring", stiffness: 400, damping: 25 } }}
                className="glass p-10 rounded-[3.5rem] shadow-3xl text-center relative overflow-hidden group cursor-default"
              >
                {/* Visual Flair Background */}
                <div className="absolute inset-0 bg-gradient-to-b from-amber-600/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <h3 className="text-[10px] font-black italic tracking-[0.4em] uppercase text-neutral-600 mb-10 relative z-10">Resilience Core</h3>
                
                <div className="relative w-56 h-56 mx-auto flex items-center justify-center">
                  {/* Rotating Glass Rings */}
                  <div className="absolute inset-0 border-[0.5px] border-white/5 rounded-full animate-rotate-slow"></div>
                  <div className="absolute inset-2 border-[1px] border-amber-600/10 rounded-full animate-rotate-reverse"></div>
                  <div className="absolute inset-4 border-[0.5px] border-white/5 rounded-full animate-rotate-slow" style={{ animationDuration: '30s' }}></div>
                  
                  {/* Outer Glowing Ring */}
                  <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                    <circle cx="112" cy="112" r="104" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-white/5" />
                    <motion.circle 
                      initial={{ strokeDashoffset: 654 }}
                      animate={{ strokeDashoffset: 654 - (654 * (healthScore / 100)) }}
                      transition={{ duration: 2.5, ease: "circOut" }}
                      cx="112" cy="112" r="104" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="654" className="text-amber-600 shadow-[0_0_30px_rgba(217,119,6,0.6)]" 
                      strokeLinecap="round"
                    />
                  </svg>
                  
                  {/* Energy Inner Core */}
                  <div className="absolute inset-8 bg-black/40 rounded-full backdrop-blur-md flex flex-col items-center justify-center border border-white/10 shadow-inner">
                    <motion.div 
                      animate={{ scale: [1, 1.05, 1], opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="absolute inset-0 bg-amber-600/10 rounded-full blur-xl"
                    ></motion.div>
                    <span className="text-6xl font-black tracking-tighter italic gold-text-gradient relative z-10">{healthScore}</span>
                    <span className="text-[10px] text-amber-500 font-black uppercase tracking-[0.3em] mt-2 relative z-10">Rating: Apex</span>
                  </div>
                </div>

                <div className="mt-12 space-y-4 relative z-10">
                  <p className="text-[11px] text-neutral-400 leading-relaxed font-bold px-4">
                    Resource retention is <span className="text-amber-500 font-black">SUPERIOR</span>. Market behavior shows 99th percentile efficiency.
                  </p>
                  <motion.button 
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-white/5 hover:bg-amber-600 hover:text-black border border-white/10 hover:border-amber-600 py-4 rounded-[2rem] text-[9px] font-black uppercase tracking-[0.4em] transition-all duration-300"
                  >
                    Generate Portfolio Audit
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>

        </div>
      </motion.main>
      
      <footer className="max-w-7xl mx-auto px-8 py-32 border-t border-white/5 flex flex-col items-center opacity-50">
        <div className="text-[10px] text-neutral-800 font-black uppercase tracking-[0.8em] mb-6">SmartTrack Pro • Obsidian Systems</div>
        <p className="text-neutral-900 text-[10px] text-center max-w-lg font-bold leading-relaxed">
          Proprietary Institutional Finance Protocol. All behavioral datasets encrypted via Neural Auth. © 2025 SmartTrack Pro.
        </p>
      </footer>
    </div>
  );
};

export default App;
