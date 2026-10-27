import React from 'react';
import { 
  BarChart3, 
  CheckCircle2, 
  XCircle, 
  Zap, 
  Clock, 
  Award, 
  Layers, 
  ArrowUpRight, 
  TrendingDown
} from 'lucide-react';

export default function CostComparisonMatrix({ costEvaluation, latestDecision }) {
  if (!costEvaluation || !costEvaluation.tier_evaluations) {
    return (
      <div className="glass-panel" style={{ padding: '32px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>
          Run an offloading decision to compute and compare multi-tier physics cost metrics.
        </p>
      </div>
    );
  }

  const { tier_evaluations, alpha_latency_weight, beta_energy_weight, deadline_ms } = costEvaluation;
  const winnerTier = latestDecision?.selected_tier;

  const tierColors = {
    LOCAL: 'var(--tier-local)',
    EDGE: 'var(--tier-edge)',
    FOG: 'var(--tier-fog)',
    CLOUD: 'var(--tier-cloud)',
  };

  // Find max latency and energy for relative bar scaling
  const allTiers = Object.values(tier_evaluations);
  const maxLatency = Math.max(...allTiers.map((t) => t.total_latency_ms), deadline_ms || 100);
  const maxEnergy = Math.max(...allTiers.map((t) => t.device_total_energy_j), 0.001);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Info */}
      <div className="glass-panel" style={{
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
            Multi-Tier Deterministic Cost Physics Matrix
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Comparative evaluation of communication delay, execution duration, and device battery energy dissipation
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>QoS Deadline: </span>
            <span className="mono" style={{ fontWeight: 600, color: '#f59e0b' }}>{deadline_ms} ms</span>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Weights: </span>
            <span className="mono" style={{ fontWeight: 600, color: '#38bdf8' }}>&alpha;={alpha_latency_weight}</span>
            <span style={{ color: 'var(--text-muted)' }}> | </span>
            <span className="mono" style={{ fontWeight: 600, color: '#10b981' }}>&beta;={beta_energy_weight}</span>
          </div>
        </div>
      </div>

      {/* Tier Breakdown Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
      }}>
        {['LOCAL', 'EDGE', 'FOG', 'CLOUD'].map((tierKey) => {
          const metrics = tier_evaluations[tierKey];
          if (!metrics) return null;

          const isWinner = winnerTier === tierKey;
          const tierColor = tierColors[tierKey];

          // Sub-component latency percentages
          const totalLat = metrics.total_latency_ms || 1;
          const upPct = (metrics.upload_delay_ms / totalLat) * 100;
          const qPct = (metrics.queue_delay_ms / totalLat) * 100;
          const compPct = (metrics.compute_delay_ms / totalLat) * 100;
          const downPct = (metrics.download_delay_ms / totalLat) * 100;
          const rttPct = (metrics.propagation_rtt_ms / totalLat) * 100;

          return (
            <div
              key={tierKey}
              className="glass-panel"
              style={{
                padding: '20px',
                borderColor: isWinner ? tierColor : 'var(--border-color)',
                boxShadow: isWinner ? `0 0 25px ${tierColor}40` : 'none',
                position: 'relative',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`badge badge-${tierKey.toLowerCase()}`} style={{ fontSize: '0.85rem' }}>
                    {tierKey}
                  </span>
                  {isWinner && (
                    <span className="badge badge-success" style={{ gap: '4px' }}>
                      <Award size={12} /> WINNER
                    </span>
                  )}
                </div>

                <span className={`badge ${metrics.is_feasible ? 'badge-success' : 'badge-danger'}`}>
                  {metrics.is_feasible ? (
                    <>
                      <CheckCircle2 size={12} /> Feasible
                    </>
                  ) : (
                    <>
                      <XCircle size={12} /> Infeasible
                    </>
                  )}
                </span>
              </div>

              {/* Composite Score Highlight */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.35)',
                padding: '10px 14px',
                borderRadius: '8px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Composite Score</span>
                <span className="mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: tierColor }}>
                  {metrics.composite_cost_score.toFixed(3)}
                </span>
              </div>

              {/* Total Latency Metric & Stacked Bar */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Total Latency</span>
                  <span className="mono" style={{ fontWeight: 600, color: metrics.total_latency_ms <= deadline_ms ? '#34d399' : '#fb7185' }}>
                    {metrics.total_latency_ms.toFixed(1)} ms
                  </span>
                </div>

                {/* Stacked Breakdown Bar */}
                <div style={{
                  height: '8px',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  display: 'flex',
                  backgroundColor: 'rgba(255,255,255,0.06)',
                }}>
                  <div style={{ width: `${upPct}%`, backgroundColor: '#38bdf8' }} title={`Upload: ${metrics.upload_delay_ms.toFixed(1)}ms`} />
                  <div style={{ width: `${qPct}%`, backgroundColor: '#f59e0b' }} title={`Queue: ${metrics.queue_delay_ms.toFixed(1)}ms`} />
                  <div style={{ width: `${compPct}%`, backgroundColor: '#a855f7' }} title={`Compute: ${metrics.compute_delay_ms.toFixed(1)}ms`} />
                  <div style={{ width: `${downPct}%`, backgroundColor: '#06b6d4' }} title={`Download: ${metrics.download_delay_ms.toFixed(1)}ms`} />
                  <div style={{ width: `${rttPct}%`, backgroundColor: '#6366f1' }} title={`RTT: ${metrics.propagation_rtt_ms.toFixed(1)}ms`} />
                </div>

                {/* Delay Sub-values */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', marginTop: '6px', fontSize: '0.65rem' }}>
                  <div style={{ color: '#38bdf8' }}>Tx: {metrics.upload_delay_ms.toFixed(1)}ms</div>
                  <div style={{ color: '#f59e0b' }}>Queue: {metrics.queue_delay_ms.toFixed(1)}ms</div>
                  <div style={{ color: '#a855f7' }}>Exec: {metrics.compute_delay_ms.toFixed(1)}ms</div>
                </div>
              </div>

              {/* Device Energy Metric */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Device Energy</span>
                  <span className="mono" style={{ fontWeight: 600, color: '#34d399' }}>
                    {metrics.device_total_energy_j.toFixed(4)} J
                  </span>
                </div>
                <div style={{
                  height: '6px',
                  borderRadius: '3px',
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${Math.min(100, (metrics.device_total_energy_j / maxEnergy) * 100)}%`,
                    height: '100%',
                    backgroundColor: '#10b981',
                  }} />
                </div>

                {/* Energy Sub-values */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', marginTop: '6px', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                  <div>Tx: {metrics.device_tx_energy_j.toFixed(3)}J</div>
                  <div>Idle: {metrics.device_idle_energy_j.toFixed(3)}J</div>
                  <div>Comp: {metrics.device_compute_energy_j.toFixed(3)}J</div>
                </div>
              </div>

              {/* Server Infrastructure Energy */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '8px',
                borderTop: '1px solid var(--border-color)',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
              }}>
                <span>Server Energy:</span>
                <span className="mono">{metrics.infra_energy_j.toFixed(3)} J</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
