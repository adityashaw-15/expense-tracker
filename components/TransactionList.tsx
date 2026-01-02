
import React from 'react';
import { Transaction, CATEGORY_METALLICS } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

export const TransactionList: React.FC<Props> = ({ transactions, onDelete }) => {
  if (transactions.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-neutral-900/20 p-16 rounded-[3rem] border-2 border-dashed border-neutral-900 flex flex-col items-center justify-center text-neutral-800"
      >
        <p className="text-xl font-black uppercase tracking-[0.2em] italic">Vault is Vacant</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {transactions.map((t, idx) => (
          <motion.div 
            layout
            key={t.id} 
            initial={{ opacity: 0, y: 15, x: 5 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)", transition: { duration: 0.2 } }}
            whileHover={{ 
              backgroundColor: "rgba(255, 255, 255, 0.03)", 
              borderColor: `${CATEGORY_METALLICS[t.category]}33`,
              boxShadow: `0 0 20px ${CATEGORY_METALLICS[t.category]}11`
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30, delay: Math.min(idx * 0.03, 0.3) }}
            className="group glass p-5 rounded-[2rem] flex items-center justify-between border-transparent hover:border-white/10 transition-colors cursor-default"
          >
            <div className="flex items-center gap-5">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                style={{ 
                  backgroundColor: `${CATEGORY_METALLICS[t.category]}22`,
                  border: `1px solid ${CATEGORY_METALLICS[t.category]}44`,
                  color: CATEGORY_METALLICS[t.category],
                  boxShadow: `0 8px 16px -4px ${CATEGORY_METALLICS[t.category]}44`
                }}
              >
                {t.category.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-neutral-100 text-sm tracking-tight group-hover:text-amber-500 transition-colors">{t.description}</p>
                <div className="flex gap-2.5 items-center text-[9px] text-neutral-500 uppercase font-black tracking-widest mt-0.5">
                  <span>{new Date(t.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}</span>
                  <span className="opacity-20">•</span>
                  <motion.span 
                    initial={{ opacity: 0.5 }}
                    whileHover={{ opacity: 1, scale: 1.05 }}
                    style={{ color: CATEGORY_METALLICS[t.category] }}
                  >
                    {t.category}
                  </motion.span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <span className="font-mono font-black text-white text-base tracking-tight">
                -₹{t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <motion.button
                whileHover={{ scale: 1.2, color: "#ef4444" }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onDelete(t.id)}
                className="w-9 h-9 flex items-center justify-center text-neutral-700 rounded-full transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </motion.button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
