import { motion } from 'framer-motion';

export default function ProgressBar({ value = 0 }) {
  const safe = Math.max(0, Math.min(100, Number(value || 0)));

  return (
    <div className="w-full">
      <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-orange-500 shadow-[0_0_16px_rgba(99,102,241,0.45)]"
          initial={{ width: 0 }}
          animate={{ width: `${safe}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      </div>
      <div className="text-right text-xs text-[#A1A1AA] mt-1">{safe}% used</div>
    </div>
  );
}
