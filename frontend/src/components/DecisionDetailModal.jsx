import React from 'react';
import { 
  X, 
  Award, 
  Clock, 
  Zap, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  HelpCircle,
  TrendingDown
} from 'lucide-react';

export default function DecisionDetailModal({ decision, explanation, onClose }) {
  if (!decision) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div className="glass-panel animate-fade-in" style={{
        maxWidth: '700px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '28px',
        position: 'relative',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
          }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Award size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>
                Decision Audit & Justification
              </h3>
              <span className={`badge badge-${decision.selected_tier?.toLowerCase()}`}>
                {decision.selected_tier}
              </span>
            </div>
            <p className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Decision ID: {decision.decision_id} | Task: {decision.task_id}
            </p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '10px',
          marginBottom: '20px',
        }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Strategy</span>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#38bdf8' }}>
              {decision.strategy?.replace(/_/g, ' ')}
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Latency</span>
            <div className="mono" style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
              {decision.total_latency_ms?.toFixed(1)} ms
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Device Energy</span>
            <div className="mono" style={{ fontSize: '1rem', fontWeight: 700, color: '#34d399' }}>
              {decision.device_energy_j?.toFixed(4)} J
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Deadline Slack</span>
            <div className="mono" style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: decision.slack_time_ms >= 0 ? '#34d399' : '#fb7185',
            }}>
              {decision.slack_time_ms >= 0 ? `+${decision.slack_time_ms?.toFixed(1)}` : decision.slack_time_ms?.toFixed(1)} ms
            </div>
          </div>
        </div>

        {/* Natural Language Explanation (if available) */}
        {explanation && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '10px',
            padding: '16px',
            marginBottom: '20px',
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
              LLM Explanation Report
            </span>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ffffff', margin: '6px 0' }}>
              "{explanation.headline}"
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {explanation.executive_summary}
            </p>
          </div>
        )}

        {/* Trade-Off Analysis */}
        {decision.trade_off && (
          <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '14px', marginBottom: '20px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b', marginBottom: '6px' }}>
              WINNER VS RUNNER-UP ({decision.trade_off.runner_up_tier}):
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
              {decision.trade_off.summary}
            </p>
          </div>
        )}

        {/* Candidate Tier Evaluations & Rejection Reasons */}
        {decision.candidate_evaluations && (
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', marginBottom: '10px' }}>
              Candidate Tier Evaluations & Rejections
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.entries(decision.candidate_evaluations).map(([tierKey, metrics]) => {
                const isSelected = decision.selected_tier === tierKey;
                const rejection = explanation?.rejection_reasons?.[tierKey];
                return (
                  <div
                    key={tierKey}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(0, 0, 0, 0.25)',
                      border: isSelected ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-color)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={`badge badge-${tierKey.toLowerCase()}`}>{tierKey}</span>
                        {isSelected && <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>[SELECTED]</span>}
                      </div>
                      <div className="mono" style={{ fontSize: '0.8rem' }}>
                        <span>Lat: {metrics.total_latency_ms?.toFixed(1)}ms | </span>
                        <span>Energy: {metrics.device_total_energy_j?.toFixed(3)}J | </span>
                        <span style={{ color: 'var(--accent-cyan)' }}>Score: {metrics.composite_cost_score?.toFixed(3)}</span>
                      </div>
                    </div>
                    {rejection && !isSelected && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', fontStyle: 'italic' }}>
                        Rejection: {rejection.reason} ({rejection.trade_off_vs_winner})
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
