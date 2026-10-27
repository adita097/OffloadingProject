import React, { useState } from 'react';
import { 
  FileCheck, 
  Layers, 
  Brain, 
  Calculator, 
  Compass, 
  MessageSquareQuote, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export default function WorkflowPipeline({ workflowState }) {
  const [selectedStage, setSelectedStage] = useState(5); // Default to Step 6 / Decision

  const stages = [
    {
      id: 0,
      number: 1,
      title: 'Data Ingestion',
      subtitle: 'Schema Normalization',
      icon: FileCheck,
      color: '#38bdf8',
    },
    {
      id: 1,
      number: 2,
      title: 'Scenario Binding',
      subtitle: 'Dynamic 5G & Queues',
      icon: Layers,
      color: '#6366f1',
    },
    {
      id: 2,
      number: 3,
      title: 'Task Classification',
      subtitle: 'LLM & Heuristic',
      icon: Brain,
      color: '#a855f7',
    },
    {
      id: 3,
      number: 4,
      title: 'Cost Physics',
      subtitle: 'Latency & Energy Tiers',
      icon: Calculator,
      color: '#ec4899',
    },
    {
      id: 4,
      number: 5,
      title: 'Algorithmic Solver',
      subtitle: 'Pareto Optimization',
      icon: Compass,
      color: '#f59e0b',
    },
    {
      id: 5,
      number: 6,
      title: 'Explanation Agent',
      subtitle: 'LangGraph Reasoning',
      icon: MessageSquareQuote,
      color: '#10b981',
    },
  ];

  const task = workflowState?.task;
  const classification = workflowState?.classification;
  const costEval = workflowState?.cost_evaluation;
  const decision = workflowState?.decision;
  const explanation = workflowState?.explanation;
  const recalculated = workflowState?.recalculated;
  const recalcReason = workflowState?.recalculation_reason;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Recalculation Alert (LangGraph dynamic state machine feedback loop) */}
      {recalculated && (
        <div style={{
          backgroundColor: 'rgba(245, 158, 11, 0.15)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <RefreshCw size={20} color="var(--accent-amber)" className="animate-spin" />
          <div>
            <span style={{ fontWeight: 600, color: '#f59e0b' }}>LangGraph Recalculation Triggered: </span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {recalcReason || 'Initial configuration violated strict deadline constraints. Agent automatically adjusted weights and solved fallback.'}
            </span>
          </div>
        </div>
      )}

      {/* 6-Stage Stepper Bar */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
              LangGraph Stateful Workflow Engine
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Deterministic Cost Physics with Selective LLM Augmentation
            </p>
          </div>
          <span className="badge badge-success">
            <CheckCircle2 size={12} /> Pipeline Synchronized
          </span>
        </div>

        {/* Stepper Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px',
          position: 'relative',
        }}>
          {stages.map((stage) => {
            const Icon = stage.icon;
            const isSelected = selectedStage === stage.id;
            return (
              <div
                key={stage.id}
                onClick={() => setSelectedStage(stage.id)}
                style={{
                  backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                  border: isSelected ? `2px solid ${stage.color}` : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  position: 'relative',
                  boxShadow: isSelected ? `0 0 20px ${stage.color}30` : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: `${stage.color}25`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Icon size={18} color={stage.color} />
                  </div>
                  <span className="mono" style={{ fontSize: '0.75rem', fontWeight: 700, color: stage.color }}>
                    Step {stage.number}
                  </span>
                </div>

                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff' }}>
                    {stage.title}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {stage.subtitle}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stage Detail Inspector Card */}
      <div className="glass-panel animate-fade-in" style={{ padding: '24px' }}>
        {selectedStage === 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <FileCheck size={22} color="#38bdf8" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Stage 1: Heterogeneous Data Ingestion & Normalization</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '18px' }}>
              Ingests raw benchmark data from Kaggle (Edge Offloading / MEC traces) and IEEE Cloud traces, normalizing diverse units into standard metrics (GFLOPs, MB payload, milliseconds).
            </p>
            {task ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Task ID</span>
                  <div className="mono" style={{ fontWeight: 600, color: '#ffffff' }}>{task.task_id}</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Workload</span>
                  <div className="mono" style={{ fontWeight: 600, color: '#38bdf8' }}>{task.workload_gigaflops} GFLOPs</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Input / Output Data</span>
                  <div className="mono" style={{ fontWeight: 600, color: '#a78bfa' }}>
                    {task.input_data_size_mb} MB / {task.output_data_size_mb} MB
                  </div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>QoS Deadline</span>
                  <div className="mono" style={{ fontWeight: 600, color: '#f59e0b' }}>{task.deadline_ms} ms</div>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No task loaded. Run a decision or stream ticks to inspect.</p>
            )}
          </div>
        )}

        {selectedStage === 1 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <Layers size={22} color="#6366f1" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Stage 2: Dynamic Scenario Construction Layer</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '18px' }}>
              Dynamically models 5G millimeter-wave channel fluctuations, Rayleigh fading, M/M/1 queuing depths at edge/fog/cloud nodes, and local device battery drain.
            </p>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Queuing Theory</span>
                <span className="mono" style={{ color: '#ffffff' }}>M/M/1 First-In-First-Out (FIFO) with service rate &mu;</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Channel Physics</span>
                <span className="mono" style={{ color: '#ffffff' }}>Shannon Capacity $C = B \log_2(1 + \text{SINR})$</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Power Dissipation</span>
                <span className="mono" style={{ color: '#ffffff' }}>$P = P_{idle} + P_{active} \cdot (\text{utilization})$</span>
              </div>
            </div>
          </div>
        )}

        {selectedStage === 2 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <Brain size={22} color="#a855f7" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Stage 3: LLM Task Semantic Classification</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '18px' }}>
              Language model classifies task properties and assigns mathematical multi-objective weights (&alpha; for latency, &beta; for energy).
            </p>
            {classification ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Compute Intensity</span>
                    <div style={{ fontWeight: 600, color: '#38bdf8' }}>{classification.compute_intensity}</div>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Data Intensity</span>
                    <div style={{ fontWeight: 600, color: '#a78bfa' }}>{classification.data_intensity}</div>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Latency Sensitivity</span>
                    <div style={{ fontWeight: 600, color: '#f59e0b' }}>{classification.latency_sensitivity}</div>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Objective Weights</span>
                    <div className="mono" style={{ fontWeight: 600, color: '#34d399' }}>
                      &alpha;={classification.alpha_latency_weight} | &beta;={classification.beta_energy_weight}
                    </div>
                  </div>
                </div>

                <div style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '8px', padding: '12px 16px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#c084fc', fontWeight: 600, marginBottom: '4px' }}>
                    CLASSIFICATION RATIONALE
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    {classification.rationale}
                  </p>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>Run a decision to see LLM task classification.</p>
            )}
          </div>
        )}

        {selectedStage === 3 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <Calculator size={22} color="#ec4899" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Stage 4: Mathematical Cost Modeling Engine</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '18px' }}>
              Computes exact deterministic physics: $T_{total} = T_{upload} + T_{queue} + T_{compute} + T_{download} + T_{RTT}$ and device energy consumption $E_{device}$.
            </p>
            {costEval?.tier_evaluations ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                {Object.entries(costEval.tier_evaluations).map(([tierKey, metrics]) => (
                  <div key={tierKey} style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span className={`badge badge-${tierKey.toLowerCase()}`}>{tierKey}</span>
                      <span className={`badge ${metrics.is_feasible ? 'badge-success' : 'badge-danger'}`}>
                        {metrics.is_feasible ? 'Feasible' : 'Deadline Exceeded'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Total Latency:</span>
                        <span className="mono" style={{ fontWeight: 600 }}>{metrics.total_latency_ms.toFixed(1)} ms</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Device Energy:</span>
                        <span className="mono" style={{ fontWeight: 600 }}>{metrics.device_total_energy_j.toFixed(3)} J</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Composite Score:</span>
                        <span className="mono" style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
                          {metrics.composite_cost_score.toFixed(3)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>Run a decision to view cost calculations across all 4 tiers.</p>
            )}
          </div>
        )}

        {selectedStage === 4 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <Compass size={22} color="#f59e0b" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Stage 5: Algorithmic Tier Selection & Solver</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '18px' }}>
              Selects the optimal execution tier using deterministic multi-objective cost minimization subject to hard QoS deadline bounds.
            </p>
            {decision ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(0,0,0,0.3)',
                  padding: '16px',
                  borderRadius: '8px',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Winning Execution Tier</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <span className={`badge badge-${decision.selected_tier.toLowerCase()}`} style={{ fontSize: '0.9rem', padding: '6px 14px' }}>
                        {decision.selected_tier}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        via {decision.strategy.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Deadline Slack</span>
                    <div className="mono" style={{
                      fontWeight: 700,
                      color: decision.slack_time_ms >= 0 ? '#34d399' : '#fb7185',
                      fontSize: '1rem',
                      marginTop: '4px',
                    }}>
                      {decision.slack_time_ms >= 0 ? `+${decision.slack_time_ms.toFixed(1)} ms` : `${decision.slack_time_ms.toFixed(1)} ms`}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Composite Cost Score</span>
                    <div className="mono" style={{ fontWeight: 700, color: 'var(--accent-cyan)', fontSize: '1rem', marginTop: '4px' }}>
                      {decision.composite_cost_score.toFixed(3)}
                    </div>
                  </div>
                </div>

                {decision.trade_off && (
                  <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px', padding: '14px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 600, marginBottom: '6px' }}>
                      TRADE-OFF VS RUNNER UP ({decision.trade_off.runner_up_tier})
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                      {decision.trade_off.summary} (Latency Delta: {decision.trade_off.latency_delta_ms.toFixed(1)} ms, Energy Delta: {decision.trade_off.energy_delta_j.toFixed(3)} J)
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No decision record available yet.</p>
            )}
          </div>
        )}

        {selectedStage === 5 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <MessageSquareQuote size={22} color="#10b981" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Stage 6: LLM Natural Language Explanation</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '18px' }}>
              LLM translates the mathematical cost scores into human-interpretable justifications, detailing bottlenecks and rejection reasons for alternative tiers.
            </p>
            {explanation ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '10px',
                  padding: '16px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Executive Summary
                    </span>
                    <span className="badge badge-success">Confidence: {explanation.confidence_level}</span>
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginBottom: '6px' }}>
                    "{explanation.headline}"
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {explanation.executive_summary}
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8' }}>WHY WINNER WON:</span>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
                      {explanation.why_winner_won}
                    </p>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b' }}>WHY RUNNER-UP LOST:</span>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
                      {explanation.why_runner_up_lost}
                    </p>
                  </div>
                </div>

                {explanation.primary_bottleneck && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(244, 63, 94, 0.1)',
                    border: '1px solid rgba(244, 63, 94, 0.25)',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                  }}>
                    <AlertCircle size={16} color="#fb7185" />
                    <span style={{ color: 'var(--text-muted)' }}>Identified Primary Bottleneck:</span>
                    <span style={{ fontWeight: 600, color: '#fb7185' }}>{explanation.primary_bottleneck}</span>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>Run a decision to view natural language explanation report.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
