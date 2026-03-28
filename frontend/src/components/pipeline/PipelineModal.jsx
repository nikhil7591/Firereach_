import { AnimatePresence, motion } from 'framer-motion';
import { XCircle } from 'lucide-react';

import ThreePipelineCanvas from './ThreePipelineCanvas';
import PipelineSlider from './PipelineSlider';
import AgentStatusPanel from './AgentStatusPanel';

export default function PipelineModal({
  open,
  onClose,
  mode,
  pipelineStatus,
  nodes,
  currentStepIndex,
  logs,
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[2500] pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute top-6 right-6 left-6 md:left-auto md:w-[860px] pointer-events-auto rounded-2xl border border-white/10 bg-[#07070ddd]/95 backdrop-blur-xl shadow-[0_30px_60px_rgba(0,0,0,0.45)] p-4"
            initial={{ opacity: 0, y: -14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-indigo-300">Live Pipeline</p>
                <h3 className="text-white font-semibold text-lg">Agent Visualization</h3>
                <p className="text-[#A1A1AA] text-xs mt-1">
                  Mode: <span className="text-white">{String(mode || 'auto').toUpperCase()}</span>
                  {' '}• Status: <span className="text-white">{String(pipelineStatus || 'idle').toUpperCase()}</span>
                </p>
              </div>
              <button type="button" className="text-white/80 hover:text-white bg-transparent border-none cursor-pointer" onClick={onClose}>
                <XCircle size={18} />
              </button>
            </div>

            <ThreePipelineCanvas nodes={nodes} />

            <div className="mt-3">
              <PipelineSlider nodes={nodes} currentStepIndex={currentStepIndex} />
            </div>

            <div className="mt-3">
              <AgentStatusPanel logs={logs} nodes={nodes} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
