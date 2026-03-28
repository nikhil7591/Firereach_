import { AnimatePresence, motion } from 'framer-motion';

export default function SettingsTabs({ tabs, activeTab, onChange, children }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const active = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`px-3.5 py-2 rounded-lg border text-sm font-medium transition ${active
                ? 'border-indigo-400/50 bg-indigo-500/20 text-white shadow-[0_0_16px_rgba(99,102,241,0.28)]'
                : 'border-white/10 bg-white/[0.03] text-[#A1A1AA] hover:text-white hover:border-white/20'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -14 }}
          transition={{ duration: 0.24, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
