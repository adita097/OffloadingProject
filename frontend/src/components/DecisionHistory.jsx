import React, { useState } from 'react';
import { 
  History, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Zap, 
  Search, 
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  PieChart
} from 'lucide-react';

export default function DecisionHistory({ history, stats, onSelectDecision }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');

  const filteredHistory = (history || []).filter((item) => {
    const matchesSearch = item.task_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.task_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.decision_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = tierFilter === 'ALL' || item.selected_tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Historical Statistics HUD */}
      {stats && (
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PieChart size={18} color="var(--accent-cyan)" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
                Aggregate Tier Routing Distribution ({stats.total_decisions || 0} Total Decisions)
              </h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Empirical multi-tier offload percentage
            </span>
          </div>

          {/* Distribution Stacked Bar */}
          <div style={{
            height: '14px',
            borderRadius: '7px',
            overflow: 'hidden',
            display: 'flex',
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            marginBottom: '14px',
          }}>
            <div style={{ width: `${stats.local_pct || 0}%`, backgroundColor: 'var(--tier-local)' }} title={`Local: ${(stats.local_pct || 0).toFixed(1)}%`} />
            <div style={{ width: `${stats.edge_pct || 0}%`, backgroundColor: 'var(--tier-edge)' }} title={`Edge: ${(stats.edge_pct || 0).toFixed(1)}%`} />
            <div style={{ width: `${stats.fog_pct || 0}%`, backgroundColor: 'var(--tier-fog)' }} title={`Fog: ${(stats.fog_pct || 0).toFixed(1)}%`} />
            <div style={{ width: `${stats.cloud_pct || 0}%`, backgroundColor: 'var(--tier-cloud)' }} title={`Cloud: ${(stats.cloud_pct || 0).toFixed(1)}%`} />
          </div>

          {/* Tier Distribution Badges */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px', borderLeft: '3px solid var(--tier-local)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>LOCAL</span>
              <div className="mono" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--tier-local)' }}>
                {(stats.local_pct || 0).toFixed(1)}%
              </div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px', borderLeft: '3px solid var(--tier-edge)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>EDGE (MEC)</span>
              <div className="mono" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--tier-edge)' }}>
                {(stats.edge_pct || 0).toFixed(1)}%
              </div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px', borderLeft: '3px solid var(--tier-fog)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>FOG GATEWAY</span>
              <div className="mono" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--tier-fog)' }}>
                {(stats.fog_pct || 0).toFixed(1)}%
              </div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px', borderLeft: '3px solid var(--tier-cloud)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>CLOUD</span>
              <div className="mono" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--tier-cloud)' }}>
                {(stats.cloud_pct || 0).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Controls */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '220px' }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            className="input-field"
            placeholder="Search decisions by Task ID or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {['ALL', 'LOCAL', 'EDGE', 'FOG', 'CLOUD'].map((tier) => (
            <button
              key={tier}
              onClick={() => setTierFilter(tier)}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: tierFilter === tier ? 600 : 400,
                backgroundColor: tierFilter === tier ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                border: tierFilter === tier ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                color: tierFilter === tier ? '#ffffff' : 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Decision Table List */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        {filteredHistory.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No matching offloading decisions found in audit history.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
              <thead>
                <tr style={{
                  borderBottom: '1px solid var(--border-color)',
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  color: 'var(--text-muted)',
                  textAlign: 'left',
                }}>
                  <th style={{ padding: '12px 16px' }}>Task & ID</th>
                  <th style={{ padding: '12px 16px' }}>Selected Tier</th>
                  <th style={{ padding: '12px 16px' }}>Total Latency</th>
                  <th style={{ padding: '12px 16px' }}>Device Energy</th>
                  <th style={{ padding: '12px 16px' }}>Slack Margin</th>
                  <th style={{ padding: '12px 16px' }}>Score</th>
                  <th style={{ padding: '12px 16px' }}>Trade-Off</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item, index) => {
                  return (
                    <tr
                      key={item.decision_id || index}
                      onClick={() => onSelectDecision && onSelectDecision(item)}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: '#ffffff' }}>{item.task_id}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.task_type}</div>
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <span className={`badge badge-${item.selected_tier?.toLowerCase()}`}>
                          {item.selected_tier}
                        </span>
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <span className="mono" style={{ fontWeight: 600 }}>{item.total_latency_ms?.toFixed(1)} ms</span>
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <span className="mono" style={{ color: '#34d399' }}>{item.device_energy_j?.toFixed(4)} J</span>
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <span className="mono" style={{ color: item.slack_time_ms >= 0 ? '#34d399' : '#fb7185', fontWeight: 600 }}>
                          {item.slack_time_ms >= 0 ? `+${item.slack_time_ms?.toFixed(1)}` : item.slack_time_ms?.toFixed(1)} ms
                        </span>
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <span className="mono" style={{ color: 'var(--accent-cyan)' }}>
                          {item.composite_cost_score?.toFixed(3)}
                        </span>
                      </td>

                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                        {item.trade_off ? (
                          <span style={{ fontSize: '0.75rem' }}>
                            Beat {item.trade_off.runner_up_tier} ({item.trade_off.latency_delta_ms?.toFixed(0)}ms)
                          </span>
                        ) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
