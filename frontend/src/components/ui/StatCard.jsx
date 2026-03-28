import { motion } from 'framer-motion';

export default function StatCard({ label, value, hint, accent = 'indigo' }) {
  const accentMap = {
    indigo: 'from-indigo-500/40 to-indigo-300/20 text-indigo-100 border-indigo-400/30',
    orange: 'from-orange-500/40 to-amber-300/20 text-orange-100 border-orange-400/30',
    emerald: 'from-emerald-500/40 to-teal-300/20 text-emerald-100 border-emerald-400/30',
  };

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
    >
      <p className="text-[#A1A1AA] text-xs uppercase tracking-[0.12em]">{label}</p>
      <div className={`mt-2 inline-flex rounded-lg px-2.5 py-1 border bg-gradient-to-br ${accentMap[accent] || accentMap.indigo}`}>
        <span className="text-xl font-bold leading-none">{value}</span>
      </div>
      {hint && <p className="text-[#A1A1AA] text-xs mt-2">{hint}</p>}
    </motion.div>
  );
}
