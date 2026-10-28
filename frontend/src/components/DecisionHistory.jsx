import React, { useState } from 'react';
import { 
  Search, 
  ChevronRight,
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

  const historyList = history || [];

  // Compute tier counts and percentages safely from stats or dynamically from history
  const totalDecisions = stats?.total_decisions || historyList.length || 0;

  let localPct = stats?.local_pct ?? stats?.percentages?.LOCAL ?? 0;
  let edgePct = stats?.edge_pct ?? stats?.percentages?.EDGE ?? 0;
  let fogPct = stats?.fog_pct ?? stats?.percentages?.FOG ?? 0;
  let cloudPct = stats?.cloud_pct ?? stats?.percentages?.CLOUD ?? 0;

  // Fallback: If stats from backend was unpopulated/0 but we have items in history, compute live:
  if (historyList.length > 0 && (localPct === 0 && edgePct === 0 && fogPct === 0 && cloudPct === 0)) {
    const counts = { LOCAL: 0, EDGE: 0, FOG: 0, CLOUD: 0 };
    historyList.forEach((d) => {
      const tier = d.selected_tier;
      if (counts[tier] !== undefined) counts[tier]++;
    });
    const len = historyList.length;
    localPct = Number(((counts.LOCAL / len) * 100).toFixed(1));
    edgePct = Number(((counts.EDGE / len) * 100).toFixed(1));
    fogPct = Number(((counts.FOG / len) * 100).toFixed(1));
    cloudPct = Number(((counts.CLOUD / len) * 100).toFixed(1));
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Historical Statistics HUD */}
      <div className="card" style={{ padding: '16px 20px', backgroundColor: '#FFFFFF' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieChart size={16} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '0.925rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Empirical Routing Distribution ({totalDecisions} Evaluated Decisions)
            </h3>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Historical offloading frequency across tiers
          </span>
        </div>

        {/* Distribution Stacked Bar */}
        <div style={{
          height: '10px',
          borderRadius: '5px',
          overflow: 'hidden',
          display: 'flex',
          backgroundColor: 'var(--border-color)',
          marginBottom: '14px',
        }}>
          {totalDecisions > 0 ? (
            <>
              <div style={{ width: `${localPct}%`, backgroundColor: 'var(--tier-local)', transition: 'width 0.3s ease' }} title={`Local: ${localPct.toFixed(1)}%`} />
              <div style={{ width: `${edgePct}%`, backgroundColor: 'var(--tier-edge)', transition: 'width 0.3s ease' }} title={`Edge: ${edgePct.toFixed(1)}%`} />
              <div style={{ width: `${fogPct}%`, backgroundColor: 'var(--tier-fog)', transition: 'width 0.3s ease' }} title={`Fog: ${fogPct.toFixed(1)}%`} />
              <div style={{ width: `${cloudPct}%`, backgroundColor: 'var(--tier-cloud)', transition: 'width 0.3s ease' }} title={`Cloud: ${cloudPct.toFixed(1)}%`} />
            </>
          ) : (
            <div style={{ width: '100%', backgroundColor: 'var(--border-color)' }} title="No decisions evaluated yet" />
          )}
        </div>

        {/* Tier Distribution Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
          <div style={{
            backgroundColor: 'var(--tier-local-bg)',
            padding: '10px 12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--tier-local-border)',
          }}>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>LOCAL</span>
            <div className="mono" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--tier-local)', marginTop: '2px' }}>
              {localPct.toFixed(1)}%
            </div>
          </div>
          <div style={{
            backgroundColor: 'var(--tier-edge-bg)',
            padding: '10px 12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--tier-edge-border)',
          }}>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>EDGE (MEC)</span>
            <div className="mono" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--tier-edge)', marginTop: '2px' }}>
              {edgePct.toFixed(1)}%
            </div>
          </div>
          <div style={{
            backgroundColor: 'var(--tier-fog-bg)',
            padding: '10px 12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--tier-fog-border)',
          }}>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>FOG GATEWAY</span>
            <div className="mono" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--tier-fog)', marginTop: '2px' }}>
              {fogPct.toFixed(1)}%
            </div>
          </div>
          <div style={{
            backgroundColor: 'var(--tier-cloud-bg)',
            padding: '10px 12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--tier-cloud-border)',
          }}>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>CLOUD</span>
            <div className="mono" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--tier-cloud)', marginTop: '2px' }}>
              {cloudPct.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '220px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Search by Task ID or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', paddingLeft: '30px' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--bg-tertiary)', padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          {['ALL', 'LOCAL', 'EDGE', 'FOG', 'CLOUD'].map((tier) => (
            <button
              key={tier}
              onClick={() => setTierFilter(tier)}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: tierFilter === tier ? 600 : 500,
                backgroundColor: tierFilter === tier ? '#FFFFFF' : 'transparent',
                border: 'none',
                boxShadow: tierFilter === tier ? 'var(--shadow-xs)' : 'none',
                color: tierFilter === tier ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Audit History Data Table */}
      <div className="card" style={{ overflow: 'hidden', backgroundColor: '#FFFFFF' }}>
        {filteredHistory.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
            No matching offloading decisions found in audit history.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Task & ID</th>
                  <th>Selected Tier</th>
                  <th>Total Latency</th>
                  <th>Device Energy</th>
                  <th>Slack Margin</th>
                  <th>Score</th>
                  <th>Trade-Off</th>
                  <th style={{ width: '40px' }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item, index) => {
                  return (
                    <tr
                      key={item.decision_id || index}
                      onClick={() => onSelectDecision && onSelectDecision(item)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.task_id}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{item.task_type}</div>
                      </td>

                      <td>
                        <span className={`badge badge-${item.selected_tier?.toLowerCase()}`}>
                          {item.selected_tier}
                        </span>
                      </td>

                      <td>
                        <span className="mono" style={{ fontWeight: 600 }}>
                          {item.total_latency_ms?.toFixed(1)} ms
                        </span>
                      </td>

                      <td>
                        <span className="mono" style={{ color: 'var(--text-primary)' }}>
                          {item.device_energy_j?.toFixed(4)} J
                        </span>
                      </td>

                      <td>
                        <span className="mono" style={{
                          color: item.slack_time_ms >= 0 ? 'var(--status-success)' : 'var(--status-error)',
                          fontWeight: 600,
                        }}>
                          {item.slack_time_ms >= 0 ? `+${item.slack_time_ms?.toFixed(1)}` : item.slack_time_ms?.toFixed(1)} ms
                        </span>
                      </td>

                      <td>
                        <span className="mono" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
                          {item.composite_cost_score?.toFixed(3)}
                        </span>
                      </td>

                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                        {item.trade_off ? (
                          <span>
                            Beat {item.trade_off.runner_up_tier} ({item.trade_off.latency_delta_ms?.toFixed(0)}ms)
                          </span>
                        ) : '—'}
                      </td>

                      <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                        <ChevronRight size={14} />
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
