import React, { useState } from 'react';
import { 
  Database, 
  Sparkles, 
  CheckCircle2, 
  BarChart, 
  RefreshCw, 
  PlayCircle,
  FileSpreadsheet
} from 'lucide-react';

export default function BenchmarkCatalog({ 
  benchmarks, 
  summary, 
  onGenerateBatch, 
  onRunBenchmark, 
  isLoading 
}) {
  const [generateCount, setGenerateCount] = useState(10);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner & Dataset Statistics */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Database size={22} color="var(--accent-cyan)" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
                Benchmark Traces & Dataset Ingestion
              </h2>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Heterogeneous edge computing traces ingested from Kaggle and IEEE standards, normalized to GFLOPs and MB
            </p>
          </div>

          {/* Synthetic Workload Generator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.3)', padding: '6px 12px', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Generate Synthetic:</span>
            <input
              type="number"
              min="1"
              max="50"
              value={generateCount}
              onChange={(e) => setGenerateCount(parseInt(e.target.value) || 5)}
              style={{ width: '60px', padding: '4px 8px', fontSize: '0.8rem' }}
              className="input-field mono"
            />
            <button
              className="btn btn-primary"
              onClick={() => onGenerateBatch(generateCount)}
              disabled={isLoading}
              style={{ padding: '6px 12px', fontSize: '0.75rem' }}
            >
              <Sparkles size={14} />
              <span>Generate Batch</span>
            </button>
          </div>
        </div>

        {/* Statistical Summary Cards */}
        {summary && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Ingested Tasks</span>
              <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#38bdf8' }}>
                {summary.total_tasks || benchmarks.length}
              </div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Avg Workload</span>
              <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#a78bfa' }}>
                {summary.avg_workload_gigaflops ? `${summary.avg_workload_gigaflops.toFixed(2)} GFLOPs` : '5.10 GFLOPs'}
              </div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Avg Payload Size</span>
              <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#34d399' }}>
                {summary.avg_input_size_mb ? `${summary.avg_input_size_mb.toFixed(2)} MB` : '2.40 MB'}
              </div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Avg QoS Deadline</span>
              <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f59e0b' }}>
                {summary.avg_deadline_ms ? `${summary.avg_deadline_ms.toFixed(0)} ms` : '320 ms'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Benchmark Workloads Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
            Available Benchmark Task Catalog ({benchmarks.length} Loaded)
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Click "Offload" to evaluate any task live
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
            <thead>
              <tr style={{
                borderBottom: '1px solid var(--border-color)',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                color: 'var(--text-muted)',
                textAlign: 'left',
              }}>
                <th style={{ padding: '12px 16px' }}>Task ID</th>
                <th style={{ padding: '12px 16px' }}>Category</th>
                <th style={{ padding: '12px 16px' }}>Workload</th>
                <th style={{ padding: '12px 16px' }}>Input / Output</th>
                <th style={{ padding: '12px 16px' }}>Deadline</th>
                <th style={{ padding: '12px 16px' }}>Source Dataset</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {benchmarks.map((task) => (
                <tr
                  key={task.task_id}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <span className="mono" style={{ fontWeight: 600, color: '#ffffff' }}>{task.task_id}</span>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                    {task.task_type}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className="mono" style={{ color: '#38bdf8' }}>{task.workload_gigaflops} GFLOPs</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className="mono">{task.input_data_size_mb} MB / {task.output_data_size_mb} MB</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className="mono" style={{ color: '#f59e0b' }}>{task.deadline_ms} ms</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                      {task.raw_source || 'benchmark'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => onRunBenchmark(task.task_id)}
                      disabled={isLoading}
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    >
                      <PlayCircle size={14} />
                      <span>Offload</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
