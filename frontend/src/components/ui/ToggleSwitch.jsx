import { motion } from 'framer-motion';

export default function ToggleSwitch({ checked, onChange, label, description }) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-3 cursor-pointer">
      <div>
        <p className="text-white text-sm font-medium">{label}</p>
        {description && <p className="text-[#A1A1AA] text-xs mt-0.5">{description}</p>}
      </div>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-7 rounded-full border transition-colors ${checked ? 'bg-indigo-500/50 border-indigo-300/40' : 'bg-white/5 border-white/20'}`}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 32 }}
          className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow"
          style={{ left: checked ? 'calc(100% - 1.55rem)' : '0.15rem' }}
        />
      </button>
    </label>
  );
}
