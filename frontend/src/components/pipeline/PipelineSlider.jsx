import { motion } from 'framer-motion';

export default function PipelineSlider({ nodes = [], currentStepIndex = 0 }) {
  if (!nodes.length) return null;

  return (
    <div className="space-y-2">
      <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400"
          animate={{ width: `${((currentStepIndex + 1) / nodes.length) * 100}%` }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {nodes.map((node, index) => {
          const active = index === currentStepIndex;
          const done = node.status === 'completed';
          return (
            <div
              key={node.id}
              className={`rounded-lg border p-2 text-xs ${active
                ? 'border-indigo-400/50 bg-indigo-500/15 text-white'
                : done
                  ? 'border-emerald-400/35 bg-emerald-500/10 text-emerald-200'
                  : 'border-white/10 bg-white/[0.03] text-[#A1A1AA]'
              }`}
            >
              <div className="font-semibold truncate">{node.label.replace(/^Step\s+\d+:\s*/i, '')}</div>
              <div className="mt-1 uppercase tracking-[0.1em]">{node.status}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
