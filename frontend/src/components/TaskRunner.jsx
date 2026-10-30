import React, { useState } from 'react';
import { 
  Send, 
  Shuffle, 
  SlidersHorizontal,
  Zap,
  Play,
  Scale,
  Clock,
  Battery
} from 'lucide-react';

export default function TaskRunner({ benchmarks, onRunOffload, isLoading, decisionNotification }) {
  const [mode, setMode] = useState('custom'); // 'custom' | 'benchmark'
  const [selectedBenchmarkId, setSelectedBenchmarkId] = useState('');
  const [strategy, setStrategy] = useState('WEIGHTED_COST_MINIMIZATION');
  
  // Custom Task Fields
  const [taskType, setTaskType] = useState('drone_obstacle_avoidance');
  const [workload, setWorkload] = useState(5.0); // GFLOPs
  const [inputSize, setInputSize] = useState(2.5); // MB
  const [outputSize, setOutputSize] = useState(0.2); // MB
  const [deadline, setDeadline] = useState(250); // ms

  const strategyOptions = [
    {
      id: 'WEIGHTED_COST_MINIMIZATION',
      label: 'Balanced Pareto',
      desc: 'Optimal trade-off between latency and energy',
      icon: Scale,
    },
    {
      id: 'LATENCY_MINIMIZATION',
      label: 'Minimize Latency',
      desc: 'Prioritize fastest completion (Strict QoS)',
      icon: Clock,
    },
    {
      id: 'ENERGY_MINIMIZATION',
      label: 'Minimize Energy',
      desc: 'Preserve end-device battery life',
      icon: Battery,
    },
  ];

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
      onRunOffload({ 
        task_id: selectedBenchmarkId || (benchmarks[0]?.task_id),
        strategy: strategy,
      });
    } else {
      onRunOffload({
        task_type: taskType,
        workload_gigaflops: Number(workload),
        input_data_size_mb: Number(inputSize),
        output_data_size_mb: Number(outputSize),
        deadline_ms: Number(deadline),
        strategy: strategy,
      });
    }
  };

  const handleRandomBenchmark = () => {
    onRunOffload({ strategy });
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="card" style={{ padding: '20px 24px', backgroundColor: '#FFFFFF' }}>
        {/* Header & Mode Switcher */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '18px',
          paddingBottom: '14px',
          borderBottom: '1px solid var(--border-color)',
        }}>
          <div>
            <h2 style={{ fontSize: '0.975rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Decision Engine & Execution Sandbox
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Configure task parameters or select benchmark workloads to trigger multi-tier offload resolution
            </p>
          </div>

          {/* Segmented Control */}
          <div style={{
            display: 'inline-flex',
            backgroundColor: 'var(--bg-tertiary)',
            padding: '3px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
          }}>
            <button
              type="button"
              onClick={() => setMode('custom')}
              style={{
                padding: '5px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                fontWeight: mode === 'custom' ? 600 : 500,
                backgroundColor: mode === 'custom' ? '#FFFFFF' : 'transparent',
                color: mode === 'custom' ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: 'none',
                boxShadow: mode === 'custom' ? 'var(--shadow-xs)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Custom Task Sandbox
            </button>
            <button
              type="button"
              onClick={() => setMode('benchmark')}
              style={{
                padding: '5px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                fontWeight: mode === 'benchmark' ? 600 : 500,
                backgroundColor: mode === 'benchmark' ? '#FFFFFF' : 'transparent',
                color: mode === 'benchmark' ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: 'none',
                boxShadow: mode === 'benchmark' ? 'var(--shadow-xs)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Benchmark Dataset
            </button>
          </div>
        </div>

        {/* Quick Presets (Custom Mode) */}
        {mode === 'custom' && (
          <div style={{ marginBottom: '18px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 500 }}>
              Workload Presets:
            </span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {taskPresets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--accent-subtle)';
                    e.currentTarget.style.borderColor = 'var(--accent-subtle-border)';
                    e.currentTarget.style.color = 'var(--accent-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }}
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
              gap: '14px',
              marginBottom: '18px',
            }}>
              {/* Task Type */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  Semantic Task Category
                </label>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Workload Demand</span>
                  <span className="mono" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{workload} GFLOPs</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="40.0"
                  step="0.2"
                  value={workload}
                  onChange={(e) => setWorkload(parseFloat(e.target.value))}
                  style={{ accentColor: 'var(--accent-primary)', marginTop: '6px' }}
                />
              </div>

              {/* Input Data Size MB */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Input Payload</span>
                  <span className="mono" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{inputSize} MB</span>
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
                  style={{ accentColor: 'var(--accent-primary)', marginTop: '6px' }}
                />
              </div>

              {/* Deadline ms */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>QoS Deadline</span>
                  <span className="mono" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{deadline} ms</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="1500"
                  step="25"
                  value={deadline}
                  onChange={(e) => setDeadline(parseInt(e.target.value))}
                  style={{ accentColor: 'var(--accent-primary)', marginTop: '6px' }}
                />
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '18px' }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Select Ingested Benchmark Task
              </label>
              <select
                className="input-field"
                value={selectedBenchmarkId}
                onChange={(e) => setSelectedBenchmarkId(e.target.value)}
                style={{ width: '100%' }}
              >
                {benchmarks.map((b) => (
                  <option key={b.task_id} value={b.task_id}>
                    {b.task_id} — {b.task_type} ({b.workload_gigaflops} GFLOPs, {b.input_data_size_mb} MB, {b.deadline_ms} ms)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Decision Strategy Selector */}
          <div style={{
            marginBottom: '20px',
            padding: '14px 16px',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                Optimization Strategy
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                Governs algorithmic tier ranking and objective weights
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '10px',
            }}>
              {strategyOptions.map((opt) => {
                const isSelected = strategy === opt.id;
                const IconComponent = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setStrategy(opt.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: isSelected
                        ? '1.5px solid var(--accent-primary)'
                        : '1px solid var(--border-color)',
                      backgroundColor: isSelected ? 'var(--accent-subtle)' : '#FFFFFF',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? 'var(--shadow-xs)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                      <IconComponent
                        size={14}
                        color={isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)'}
                      />
                      <span style={{
                        fontSize: '0.8rem',
                        fontWeight: isSelected ? 600 : 500,
                        color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)',
                      }}>
                        {opt.label}
                      </span>
                    </div>
                    <span style={{
                      fontSize: '0.7rem',
                      color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      lineHeight: 1.3,
                      opacity: isSelected ? 0.9 : 0.8,
                    }}>
                      {opt.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Zap size={14} className="animate-spin" />
                  <span>Evaluating Routing...</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>Run Offload Decision</span>
                </>
              )}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleRandomBenchmark}
              disabled={isLoading}
            >
              <Shuffle size={14} />
              <span>Random Benchmark Task</span>
            </button>

            {/* Decision Execution Notification in the user-specified region */}
            {decisionNotification && (
              <div
                className="animate-fade-in"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 14px',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-xs)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: decisionNotification.tier
                      ? `var(--tier-${decisionNotification.tier.toLowerCase()})`
                      : (decisionNotification.isError ? 'var(--status-danger)' : 'var(--accent-primary)'),
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                />
                <span>{decisionNotification.text}</span>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
