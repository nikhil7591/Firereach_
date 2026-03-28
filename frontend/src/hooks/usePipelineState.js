import { useMemo } from 'react';

export default function usePipelineState({ steps = [], loading = false, mode = 'auto', selectedCompanyName = '' }) {
  const nodes = useMemo(() => steps.map((step, index) => {
    const base = {
      id: step.id,
      label: step.label,
      index,
      status: step.status || 'pending',
      message: step.message || '',
    };
    return base;
  }), [steps]);

  const currentStep = useMemo(() => {
    const running = nodes.find((node) => node.status === 'in-progress');
    if (running) return running;
    const failed = nodes.find((node) => node.status === 'failed');
    if (failed) return failed;
    return nodes.filter((node) => node.status === 'completed').slice(-1)[0] || nodes[0] || null;
  }, [nodes]);

  const pipelineStatus = useMemo(() => {
    if (nodes.some((node) => node.status === 'failed')) return 'error';
    if (!loading && nodes.every((node) => node.status === 'completed')) return 'completed';
    if (mode === 'manual' && nodes.find((n) => n.id === 'step5')?.status === 'completed' && !selectedCompanyName) {
      return 'paused';
    }
    return loading ? 'running' : 'idle';
  }, [nodes, loading, mode, selectedCompanyName]);

  const currentStepIndex = Math.max(0, nodes.findIndex((node) => node.id === currentStep?.id));

  return {
    nodes,
    currentStep,
    currentStepIndex,
    pipelineStatus,
  };
}
