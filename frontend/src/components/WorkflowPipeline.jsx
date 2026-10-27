import React, { useState } from 'react';
import { 
  FileCheck, 
  Layers, 
  Brain, 
  Calculator, 
  Compass, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  ChevronRight
} from 'lucide-react';

export default function WorkflowPipeline({ workflowState }) {
  const [selectedStage, setSelectedStage] = useState(5); // Default to Step 6 / Decision Explanation

  const stages = [
    {
      id: 0,
      number: 1,
      title: 'Data Ingestion',
      subtitle: 'Schema Normalization',
      icon: FileCheck,
    },
    {
      id: 1,
      number: 2,
      title: 'Scenario Binding',
      subtitle: 'Dynamic 5G & Queues',
      icon: Layers,
    },
    {
      id: 2,
      number: 3,
      title: 'Task Classification',
      subtitle: 'Semantic & Weights',
      icon: Brain,
    },
    {
      id: 3,
      number: 4,
      title: 'Cost Physics',
      subtitle: 'Latency & Energy Tiers',
      icon: Calculator,
    },
    {
      id: 4,
      number: 5,
      title: 'Algorithmic Solver',
      subtitle: 'Multi-Objective Pareto',
      icon: Compass,
    },
    {
      id: 5,
      number: 6,
      title: 'Explanation Agent',
      subtitle: 'Structured Reasoning',
      icon: MessageSquare,
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
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Recalculation Alert (LangGraph feedback loop) */}
      {recalculated && (
        <div style={{
          backgroundColor: 'var(--status-warning-bg)',
          border: '1px solid var(--status-warning-border)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <RefreshCw size={16} color="var(--status-warning)" className="animate-spin" />
          <div style={{ fontSize: '0.8125rem' }}>
            <span style={{ fontWeight: 600, color: 'var(--status-warning)' }}>LangGraph State Loop: </span>
            <span style={{ color: 'var(--text-secondary)' }}>
              {recalcReason || 'Initial configuration violated deadline constraints. State machine re-routed with adaptive weights.'}
            </span>
          </div>
        </div>
      )}

      {/* 6-Stage Stepper Header Card */}
      <div className="card" style={{ padding: '16px 20px', backgroundColor: '#FFFFFF' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h2 style={{ fontSize: '0.975rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              LangGraph Six-Stage Workflow
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Deterministic cost physics execution with selective LLM augmentation
            </p>
          </div>
          <span className="badge badge-success">
            <CheckCircle2 size={12} /> Pipeline Synchronized
          </span>
        </div>

        {/* Horizontal Step Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '10px',
        }}>
          {stages.map((stage) => {
            const Icon = stage.icon;
            const isSelected = selectedStage === stage.id;
            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => setSelectedStage(stage.id)}
                style={{
                  textAlign: 'left',
                  backgroundColor: isSelected ? 'var(--accent-subtle)' : '#FFFFFF',
                  border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 14px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  boxShadow: isSelected ? '0 0 0 1px var(--accent-primary)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isSelected ? '#FFFFFF' : 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  }}>
                    <Icon size={14} />
                  </div>
                  <span className="mono" style={{
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    color: isSelected ? 'var(--accent-primary)' : 'var(--text-muted)',
                  }}>
                    Step {stage.number}
                  </span>
                </div>

                <div>
                  <div style={{
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)',
                  }}>
                    {stage.title}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
                    {stage.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stage Detail Inspector Card */}
      <div className="card" style={{ padding: '20px 24px', backgroundColor: '#FFFFFF' }}>
        {selectedStage === 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <FileCheck size={18} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Stage 1: Heterogeneous Data Ingestion & Normalization
              </h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginBottom: '16px', lineHeight: 1.5 }}>
              Normalizes input task telemetry from raw traces into standardized units: computation intensity in GFLOPs, network payload in MB, and QoS deadline constraints in milliseconds.
            </p>
            {task ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'block' }}>Task Identifier</span>
                  <div className="mono" style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>{task.task_id}</div>
                </div>
                <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'block' }}>Workload Demand</span>
                  <div className="mono" style={{ fontWeight: 600, color: 'var(--accent-primary)', marginTop: '2px' }}>{task.workload_gigaflops} GFLOPs</div>
                </div>
                <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'block' }}>Input / Output Payload</span>
                  <div className="mono" style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                    {task.input_data_size_mb} MB / {task.output_data_size_mb} MB
                  </div>
                </div>
                <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'block' }}>QoS Deadline</span>
                  <div className="mono" style={{ fontWeight: 600, color: 'var(--status-warning)', marginTop: '2px' }}>{task.deadline_ms} ms</div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', fontSize: '0.8125rem', textAlign: 'center' }}>
                No task loaded. Execute a decision from the Decision Engine to inspect live stage inputs.
              </div>
            )}
          </div>
        )}

        {selectedStage === 1 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Layers size={18} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Stage 2: Dynamic Scenario Construction Layer
              </h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginBottom: '16px', lineHeight: 1.5 }}>
              Binds current network channel conditions, millimeter-wave fading parameters, M/M/1 queuing states, and device battery level to the active offloading context.
            </p>
            <div style={{
              backgroundColor: 'var(--bg-tertiary)',
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Queuing Theory</span>
                <span className="mono" style={{ color: 'var(--text-primary)' }}>M/M/1 First-In-First-Out (FIFO) queue delay</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Channel Physics</span>
                <span className="mono" style={{ color: 'var(--text-primary)' }}>Shannon capacity with Rayleigh fading channel model</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Device Energy Dissipation</span>
                <span className="mono" style={{ color: 'var(--text-primary)' }}>Active transmission power + idle baseline draw</span>
              </div>
            </div>
          </div>
        )}

        {selectedStage === 2 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Brain size={18} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Stage 3: LLM Task Semantic Classification
              </h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginBottom: '16px', lineHeight: 1.5 }}>
              Determines semantic workload properties and computes mathematical multi-objective weights (&alpha; for latency, &beta; for energy conservation).
            </p>
            {classification ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                  <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Compute Intensity</span>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px', fontSize: '0.875rem' }}>{classification.compute_intensity}</div>
                  </div>
                  <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Data Intensity</span>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px', fontSize: '0.875rem' }}>{classification.data_intensity}</div>
                  </div>
                  <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Latency Sensitivity</span>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px', fontSize: '0.875rem' }}>{classification.latency_sensitivity}</div>
                  </div>
                  <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Objective Weights</span>
                    <div className="mono" style={{ fontWeight: 600, color: 'var(--accent-primary)', marginTop: '2px', fontSize: '0.875rem' }}>
                      &alpha;={classification.alpha_latency_weight} · &beta;={classification.beta_energy_weight}
                    </div>
                  </div>
                </div>

                <div style={{
                  backgroundColor: 'var(--accent-subtle)',
                  border: '1px solid var(--accent-subtle-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--accent-primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                    Classification Rationale
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    {classification.rationale}
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', fontSize: '0.8125rem', textAlign: 'center' }}>
                Run an offloading decision to view semantic LLM task classification.
              </div>
            )}
          </div>
        )}

        {selectedStage === 3 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Calculator size={18} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Stage 4: Mathematical Cost Modeling Engine
              </h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginBottom: '16px', lineHeight: 1.5 }}>
              Calculates deterministic latency components (upload, queue, execution, downlink, and propagation delay) along with device energy dissipation across all 4 tiers.
            </p>
            {costEval?.tier_evaluations ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                {Object.entries(costEval.tier_evaluations).map(([tierKey, metrics]) => (
                  <div
                    key={tierKey}
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span className={`badge badge-${tierKey.toLowerCase()}`}>{tierKey}</span>
                      <span className={`badge ${metrics.is_feasible ? 'badge-success' : 'badge-danger'}`}>
                        {metrics.is_feasible ? 'Feasible' : 'Deadline Exceeded'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Total Latency:</span>
                        <span className="mono" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {metrics.total_latency_ms.toFixed(1)} ms
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Device Energy:</span>
                        <span className="mono" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {metrics.device_total_energy_j.toFixed(3)} J
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px', borderTop: '1px solid var(--border-color)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Composite Score:</span>
                        <span className="mono" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
                          {metrics.composite_cost_score.toFixed(3)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', fontSize: '0.8125rem', textAlign: 'center' }}>
                Run an offload decision to view multi-tier deterministic cost calculations.
              </div>
            )}
          </div>
        )}

        {selectedStage === 4 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Compass size={18} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Stage 5: Algorithmic Tier Selection & Solver
              </h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginBottom: '16px', lineHeight: 1.5 }}>
              Executes Pareto cost minimization subject to hard QoS deadline bounds to choose the optimal execution tier.
            </p>
            {decision ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'var(--bg-tertiary)',
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  flexWrap: 'wrap',
                  gap: '14px',
                }}>
                  <div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Selected Execution Tier</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                      <span className={`badge badge-${decision.selected_tier.toLowerCase()}`} style={{ fontSize: '0.85rem' }}>
                        {decision.selected_tier}
                      </span>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        via {decision.strategy.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Deadline Slack</span>
                    <div className="mono" style={{
                      fontWeight: 600,
                      color: decision.slack_time_ms >= 0 ? 'var(--status-success)' : 'var(--status-error)',
                      fontSize: '0.925rem',
                      marginTop: '3px',
                    }}>
                      {decision.slack_time_ms >= 0 ? `+${decision.slack_time_ms.toFixed(1)} ms` : `${decision.slack_time_ms.toFixed(1)} ms`}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Composite Score</span>
                    <div className="mono" style={{ fontWeight: 600, color: 'var(--accent-primary)', fontSize: '0.925rem', marginTop: '3px' }}>
                      {decision.composite_cost_score.toFixed(3)}
                    </div>
                  </div>
                </div>

                {decision.trade_off && (
                  <div style={{
                    backgroundColor: 'var(--status-warning-bg)',
                    border: '1px solid var(--status-warning-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px',
                  }}>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--status-warning)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                      Trade-Off vs Runner-Up ({decision.trade_off.runner_up_tier})
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                      {decision.trade_off.summary} (Latency Delta: {decision.trade_off.latency_delta_ms.toFixed(1)} ms, Energy Delta: {decision.trade_off.energy_delta_j.toFixed(3)} J)
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', fontSize: '0.8125rem', textAlign: 'center' }}>
                No active decision record available.
              </div>
            )}
          </div>
        )}

        {selectedStage === 5 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <MessageSquare size={18} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Stage 6: LLM Natural Language Explanation
              </h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginBottom: '16px', lineHeight: 1.5 }}>
              Translates mathematical optimization calculations into clear, auditable reasoning explaining why the winning tier was chosen and why alternative tiers were rejected.
            </p>
            {explanation ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 18px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Executive Summary
                    </span>
                    <span className="badge badge-neutral">Confidence: {explanation.confidence_level}</span>
                  </div>
                  <div style={{ fontSize: '0.925rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    "{explanation.headline}"
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {explanation.executive_summary}
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                  <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--status-success)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                      Why Winner Won:
                    </span>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', marginTop: '4px', lineHeight: 1.5 }}>
                      {explanation.why_winner_won}
                    </p>
                  </div>
                  <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--status-warning)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                      Why Runner-Up Lost:
                    </span>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', marginTop: '4px', lineHeight: 1.5 }}>
                      {explanation.why_runner_up_lost}
                    </p>
                  </div>
                </div>

                {explanation.primary_bottleneck && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: 'var(--status-error-bg)',
                    border: '1px solid var(--status-error-border)',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.8125rem',
                  }}>
                    <AlertCircle size={15} color="var(--status-error)" />
                    <span style={{ color: 'var(--text-secondary)' }}>Identified Primary Bottleneck:</span>
                    <span style={{ fontWeight: 600, color: 'var(--status-error)' }}>{explanation.primary_bottleneck}</span>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', fontSize: '0.8125rem', textAlign: 'center' }}>
                Run an offload decision to view natural language explanation report.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
