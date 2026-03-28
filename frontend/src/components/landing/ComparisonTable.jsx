import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

const rows = [
  { feature: 'ICP-to-Inbox Pipeline', us: true, others: false },
  { feature: 'Live NDJSON Streaming', us: true, others: false },
  { feature: 'Intelligent ICP Scoring', us: true, others: false },
  { feature: 'Verified Email Contacts', us: true, others: false },
  { feature: 'Auto PDF Attachment', us: true, others: false },
  { feature: 'Token-Optimized (1 company only)', us: true, others: false },
  { feature: 'Setup Time', usText: '<3 minutes', othersText: '2–4 hours' },
  { feature: 'Manual Effort', usText: 'Zero', othersText: 'Constant' },
];

export default function ComparisonTable() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-indigo-400 text-xs font-semibold tracking-widest uppercase mb-3">Comparison</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Why Choose <span className="italic font-serif text-white/80">FireReach</span>
          </h2>
          <p className="text-[#A1A1AA] text-base max-w-lg mx-auto leading-relaxed font-light">
            See how FireReach stacks up against traditional outreach tools.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="landing-card-hover overflow-hidden rounded-2xl border border-white/[0.06]"
        >
          {/* Header */}
          <div className="grid grid-cols-3 bg-white/[0.03]">
            <div className="p-4 text-sm font-semibold text-[#A1A1AA]">Feature</div>
            <div className="p-4 text-sm font-semibold text-center">
              <span className="text-white px-3 py-1 rounded-lg bg-indigo-500/20 border border-indigo-500/30">
                🔥 FireReach
              </span>
            </div>
            <div className="p-4 text-sm font-semibold text-center text-[#A1A1AA]/60">Others</div>
          </div>

          {/* Rows */}
          {rows.map((r, i) => (
            <div key={r.feature} className={`grid grid-cols-3 border-t border-white/[0.04] ${i % 2 === 0 ? 'bg-white/[0.01]' : ''}`}>
              <div className="p-4 text-sm text-[#A1A1AA] font-medium">{r.feature}</div>
              <div className="p-4 flex items-center justify-center">
                {r.usText ? (
                  <span className="text-sm text-green-400 font-semibold">{r.usText}</span>
                ) : r.us ? (
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-green-400" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
                    <X className="w-3.5 h-3.5 text-red-400" />
                  </div>
                )}
              </div>
              <div className="p-4 flex items-center justify-center">
                {r.othersText ? (
                  <span className="text-sm text-red-400/60 font-medium">{r.othersText}</span>
                ) : r.others ? (
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-green-400" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center">
                    <X className="w-3.5 h-3.5 text-red-400/40" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
