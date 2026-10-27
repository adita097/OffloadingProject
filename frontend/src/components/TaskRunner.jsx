import React, { useState } from 'react';
import { 
  Sliders, 
  Send, 
  Shuffle, 
  Cpu, 
  HardDrive, 
  Clock, 
  Zap, 
  CheckCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';

export default function TaskRunner({ benchmarks, onRunOffload, isLoading }) {
  const [mode, setMode] = useState('custom'); // 'custom' | 'benchmark'
  const [selectedBenchmarkId, setSelectedBenchmarkId] = useState('');
  
  // Custom Task Fields
  const [taskType, setTaskType] = useState('drone_obstacle_avoidance');
  const [workload, setWorkload] = useState(5.0); // GFLOPs
  const [inputSize, setInputSize] = useState(2.5); // MB
  const [outputSize, setOutputSize] = useState(0.2); // MB
  const [deadline, setDeadline] = useState(250); // ms

  const taskPresets = [
    { label: 'Autonomous Drone Nav', type: 'drone_navigation', gflops: 8.5, inputMb: 3.5, deadlineMs: 180 },
    { label: 'Smart Cam Face ID', type: 'face_recognition', gflops: 3.2, inputMb: 1.8, deadlineMs: 300 },
    { label: 'IoT Sensor Telemetry', type: 'telemetry_aggregation', gflops: 0.8, inputMb: 0.2, deadlineMs: 800 },
    { label: 'Deep Neural Net Inference', type: 'deep_learning_vision', gflops: 25.0, inputMb: 8.0, deadlineMs: 400 },
    { label: 'AR Hologram Overlay', type: 'ar_rendering', gflops: 12.0, inputMb: 4.0, deadlineMs: 120 },
  ];

  const handleApplyPreset = (preset) => {
    setTaskType(preset.type);
    setWorkload(preset.gflops);
    setInputSize(preset.inputMb);
    setOutputSize(Number((preset.inputMb * 0.1).toFixed(2)));
    setDeadline(preset.deadlineMs);
    setMode('custom');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'benchmark') {
      onRunOffload({ task_id: selectedBenchmarkId || (benchmarks[0]?.task_id) });
    } else {
      onRunOffload({
        task_type: taskType,
        workload_gigaflops: Number(workload),
        input_data_size_mb: Number(inputSize),
        output_data_size_mb: Number(outputSize),
        deadline_ms: Number(deadline),
      });
    }
  };

  const handleRandomBenchmark = () => {
    onRunOffload({});
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
              Offloading Decision Engine & Sandbox
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Configure workloads or test benchmark scenarios to trigger the 6-stage LangGraph workflow
            </p>
          </div>

          {/* Mode Switcher */}
          <div style={{
            display: 'flex',
            backgroundColor: 'rgba(0,0,0,0.3)',
            padding: '3px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
          }}>
            <button
              type="button"
              onClick={() => setMode('custom')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: mode === 'custom' ? 600 : 400,
                backgroundColor: mode === 'custom' ? 'var(--accent-blue)' : 'transparent',
                color: mode === 'custom' ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Custom Task Sandbox
            </button>
            <button
              type="button"
              onClick={() => setMode('benchmark')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: mode === 'benchmark' ? 600 : 400,
                backgroundColor: mode === 'benchmark' ? 'var(--accent-blue)' : 'transparent',
                color: mode === 'benchmark' ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Benchmark Dataset
            </button>
          </div>
        </div>

        {/* Quick Presets (when in Custom mode) */}
        {mode === 'custom' && (
          <div style={{ marginBottom: '20px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
              QUICK WORKLOAD PRESETS:
            </span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {taskPresets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-cyan)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Submission Form */}
        <form onSubmit={handleSubmit}>
          {mode === 'custom' ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
              marginBottom: '20px',
            }}>
              {/* Task Type */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Semantic Task Category</label>
                <input
                  type="text"
                  className="input-field"
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value)}
                  placeholder="e.g. computer_vision_inference"
                  required
                />
              </div>

              {/* Workload GFLOPs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Workload (GFLOPs)</span>
                  <span className="mono" style={{ color: '#38bdf8', fontWeight: 600 }}>{workload} GFLOPs</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="40.0"
                  step="0.2"
                  value={workload}
                  onChange={(e) => setWorkload(parseFloat(e.target.value))}
                  style={{ accentColor: 'var(--accent-cyan)' }}
                />
              </div>

              {/* Input Data Size MB */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Input Data Payload (MB)</span>
                  <span className="mono" style={{ color: '#a78bfa', fontWeight: 600 }}>{inputSize} MB</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="15.0"
                  step="0.1"
                  value={inputSize}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setInputSize(val);
                    setOutputSize(Number((val * 0.1).toFixed(2)));
                  }}
                  style={{ accentColor: 'var(--tier-fog)' }}
                />
              </div>

              {/* Deadline ms */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>QoS Deadline (ms)</span>
                  <span className="mono" style={{ color: '#f59e0b', fontWeight: 600 }}>{deadline} ms</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="1500"
                  step="25"
                  value={deadline}
                  onChange={(e) => setDeadline(parseInt(e.target.value))}
                  style={{ accentColor: 'var(--accent-amber)' }}
                />
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Select Benchmark Workload</label>
              <select
                className="input-field"
                value={selectedBenchmarkId}
                onChange={(e) => setSelectedBenchmarkId(e.target.value)}
                style={{ width: '100%' }}
              >
                {benchmarks.map((b) => (
                  <option key={b.task_id} value={b.task_id} style={{ background: '#0a0e17' }}>
                    {b.task_id} — {b.task_type} ({b.workload_gigaflops} GFLOPs, {b.input_data_size_mb} MB, {b.deadline_ms} ms)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
              style={{ minWidth: '180px' }}
            >
              {isLoading ? (
                <>
                  <Zap size={16} className="animate-spin" />
                  <span>Solving Workflow...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Execute LangGraph Offload</span>
                </>
              )}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleRandomBenchmark}
              disabled={isLoading}
            >
              <Shuffle size={16} />
              <span>Random Benchmark Task</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
