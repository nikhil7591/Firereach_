export default function AgentStatusPanel({ logs = [], nodes = [] }) {
  const latest = logs.slice(0, 8);

  return (
    <div className="grid md:grid-cols-2 gap-3">
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
        <h4 className="text-white text-sm font-semibold mb-2">Agent States</h4>
        <div className="space-y-2">
          {nodes.map((node) => (
            <div key={node.id} className="flex items-center justify-between text-xs border-b border-white/5 pb-1">
              <span className="text-[#E4E4E7] truncate pr-2">{node.label.replace(/^Step\s+\d+:\s*/i, '')}</span>
              <span className={`uppercase tracking-[0.1em] ${node.status === 'completed'
                ? 'text-emerald-300'
                : node.status === 'in-progress'
                  ? 'text-amber-300'
                  : node.status === 'failed'
                    ? 'text-rose-300'
                    : 'text-[#A1A1AA]'
              }`}>{node.status}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
        <h4 className="text-white text-sm font-semibold mb-2">Live Logs</h4>
        <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
          {latest.length === 0 && <p className="text-[#A1A1AA] text-xs">No logs yet.</p>}
          {latest.map((log, index) => (
            <div key={`${log.step}-${index}`} className="text-xs rounded-lg border border-white/10 bg-black/20 p-2">
              <div className="text-[#A1A1AA] uppercase tracking-[0.1em]">{log.step}</div>
              <div className="text-[#E4E4E7] mt-0.5">{log.message || 'Working...'}</div>
              <div className="text-indigo-300 mt-0.5">{log.status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
