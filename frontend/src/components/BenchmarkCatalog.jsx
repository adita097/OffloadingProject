import React, { useState } from 'react';
import { 
  Database, 
  Sparkles, 
  Play
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
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Banner & Dataset Statistics */}
      <div className="card" style={{ padding: '20px 24px', backgroundColor: '#FFFFFF' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={18} color="var(--accent-primary)" />
              <h2 style={{ fontSize: '0.975rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Datasets & Benchmark Catalog
              </h2>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Normalized edge traces and synthetic workloads evaluated across local, edge, fog, and cloud tiers
            </p>
          </div>

          {/* Synthetic Workload Generator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            padding: '5px 10px',
            borderRadius: 'var(--radius-md)',
          }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Generate Tasks:</span>
            <input
              type="number"
              min="1"
              max="50"
              value={generateCount}
              onChange={(e) => setGenerateCount(parseInt(e.target.value) || 5)}
              style={{ width: '50px', padding: '3px 6px', fontSize: '0.75rem', textAlign: 'center' }}
              className="input-field mono"
            />
            <button
              className="btn btn-primary"
              onClick={() => onGenerateBatch(generateCount)}
              disabled={isLoading}
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
            >
              <Sparkles size={12} />
              <span>Generate</span>
            </button>
          </div>
        </div>

        {/* Statistical Summary Cards */}
        {summary && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
            <div style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', padding: '12px 14px', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>Ingested Tasks</span>
              <div className="mono" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                {summary.total_tasks || benchmarks.length}
              </div>
            </div>
            <div style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', padding: '12px 14px', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>Avg Workload</span>
              <div className="mono" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                {summary.avg_workload_gigaflops ? `${summary.avg_workload_gigaflops.toFixed(2)} GFLOPs` : '5.10 GFLOPs'}
              </div>
            </div>
            <div style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', padding: '12px 14px', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>Avg Payload Size</span>
              <div className="mono" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                {summary.avg_input_size_mb ? `${summary.avg_input_size_mb.toFixed(2)} MB` : '2.40 MB'}
              </div>
            </div>
            <div style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', padding: '12px 14px', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>Avg QoS Deadline</span>
              <div className="mono" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                {summary.avg_deadline_ms ? `${summary.avg_deadline_ms.toFixed(0)} ms` : '320 ms'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Benchmark Workloads Table */}
      <div className="card" style={{ overflow: 'hidden', backgroundColor: '#FFFFFF' }}>
        <div style={{
          padding: '12px 18px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#F8FAFC',
        }}>
          <h3 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Benchmark Traces ({benchmarks.length} Tasks)
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Select "Run Offload" to evaluate routing decisions
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Task ID</th>
                <th>Category</th>
                <th>Workload</th>
                <th>Payload (In / Out)</th>
                <th>QoS Deadline</th>
                <th>Source</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {benchmarks.map((task) => (
                <tr key={task.task_id}>
                  <td>
                    <span className="mono" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {task.task_id}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {task.task_type}
                  </td>
                  <td>
                    <span className="mono" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {task.workload_gigaflops} GFLOPs
                    </span>
                  </td>
                  <td>
                    <span className="mono" style={{ color: 'var(--text-secondary)' }}>
                      {task.input_data_size_mb} MB / {task.output_data_size_mb} MB
                    </span>
                  </td>
                  <td>
                    <span className="mono" style={{ color: 'var(--text-primary)' }}>
                      {task.deadline_ms} ms
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-neutral" style={{ fontSize: '0.6875rem' }}>
                      {task.raw_source || 'benchmark'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-secondary"
                      onClick={() => onRunBenchmark(task.task_id)}
                      disabled={isLoading}
                      style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                    >
                      <Play size={11} />
                      <span>Run Offload</span>
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
