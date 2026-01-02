
import React, { useState } from 'react';
import { Category, Transaction, CATEGORY_METALLICS } from '../types';
import { suggestCategory } from '../services/geminiService';
import { motion } from 'framer-motion';

interface Props {
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
}

const CATEGORIES: Category[] = [
  'Food & Dining', 'Shopping', 'Transport', 'Bills & Utilities', 
  'Entertainment', 'Health', 'Travel', 'Others'
];

export const TransactionForm: React.FC<Props> = ({ onAdd }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('Others');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    onAdd({
      amount: parseFloat(amount),
      description,
      category,
      date,
      type: 'expense'
    });

    setAmount('');
    setDescription('');
    setCategory('Others');
  };

  const handleBlurDescription = async () => {
    if (!description || description.length < 3) return;
    setIsSuggesting(true);
    const suggestion = await suggestCategory(description);
    if (CATEGORIES.includes(suggestion as Category)) {
      setCategory(suggestion as Category);
    }
    setIsSuggesting(false);
  };

  return (
    <motion.form 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -8, scale: 1.01, boxShadow: "0 20px 40px rgba(0,0,0,0.6)" }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onSubmit={handleSubmit} 
      className="glass p-8 rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden group cursor-default"
    >
      <div 
        className="absolute top-0 left-0 w-1 h-full transition-colors duration-500" 
        style={{ backgroundColor: CATEGORY_METALLICS[category] }}
      ></div>
      
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-amber-500 shadow-xl transition-transform group-hover:rotate-12">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
        </div>
        <div>
           <h3 className="text-lg font-black tracking-tight text-white uppercase italic">Ledger Input</h3>
           <p className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest">Authorize Record</p>
        </div>
      </div>
      
      <div className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.2em] ml-1">Merchant / Detail</label>
          <input
            type="text"
            placeholder="Authorized Context..."
            className="w-full px-5 py-4 rounded-2xl bg-black border border-neutral-800 text-white focus:border-amber-600/50 transition-all outline-none font-medium placeholder:text-neutral-800"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleBlurDescription}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.2em] ml-1">Asset Volume (₹)</label>
          <input
            type="number"
            step="0.01"
            placeholder="0.00"
            className="w-full px-5 py-4 rounded-2xl bg-black border border-neutral-800 text-white focus:border-amber-600/50 transition-all outline-none font-mono font-black text-lg placeholder:text-neutral-800"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.2em] ml-1 flex justify-between">
            Classification 
            {isSuggesting && <span className="text-amber-500 animate-pulse lowercase italic">AI Stream...</span>}
          </label>
          <div className="relative">
            <select
              className="w-full px-5 py-4 rounded-2xl bg-black border border-neutral-800 text-white focus:border-amber-600/50 transition-all outline-none appearance-none cursor-pointer font-bold text-xs"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              style={{ color: CATEGORY_METALLICS[category] }}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat} style={{ color: CATEGORY_METALLICS[cat], background: '#000' }}>{cat}</option>
              ))}
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-700">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.2em] ml-1">Timestamp</label>
          <input
            type="date"
            className="w-full px-5 py-4 rounded-2xl bg-black border border-neutral-800 text-white focus:border-amber-600/50 transition-all outline-none cursor-pointer font-bold text-xs"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02, y: -2, boxShadow: '0 10px 30px rgba(217, 119, 6, 0.3)' }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        className="w-full mt-10 gold-gradient text-black font-black py-4.5 rounded-[2rem] shadow-2xl transition-all uppercase tracking-widest text-[11px] italic"
      >
        Authorize Commitment
      </motion.button>
    </motion.form>
  );
};
