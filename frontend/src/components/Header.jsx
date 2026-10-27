import React from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  Activity, 
  Cpu, 
  Network, 
  Sliders, 
  Layers, 
  Zap, 
  BarChart3, 
  History, 
  Database,
  Radio,
  Clock
} from 'lucide-react';

export default function Header({
  activeTab,
  setActiveTab,
  scenarios,
  selectedScenario,
  onSelectScenario,
  isSimulating,
  onToggleSimulate,
  onTriggerStep,
  tick,
  wsStatus,
  simInterval,
  setSimInterval,
}) {
  return (
    <header style={{
      borderBottom: '1px solid var(--border-color)',
      backgroundColor: 'rgba(10, 14, 23, 0.85)',
      backdropFilter: 'var(--glass-filter)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '12px 24px',
    }}>
      {/* Top Bar: Title, Project Meta & Live Status */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0284c7 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.35)',
          }}>
            <Cpu size={24} color="#ffffff" />
          </div>
            <div>
              <h1 style={{
                fontSize: '1.3rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                background: 'linear-gradient(90deg, #f8fafc 0%, #38bdf8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Adaptive Offloading Agent
              </h1>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Real-Time Edge / Fog / Cloud Routing with Deterministic Cost Physics & LLM Explainability
              </p>
            </div>
        </div>

        {/* Live Controls: Scenario, Simulation & WebSocket Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Tick Counter */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-color)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8rem',
          }}>
            <Clock size={14} color="var(--accent-cyan)" />
            <span style={{ color: 'var(--text-secondary)' }}>Tick:</span>
            <span className="mono" style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>#{tick}</span>
          </div>

          {/* Scenario Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Radio size={14} color="var(--accent-amber)" />
            <select
              className="input-field"
              value={selectedScenario}
              onChange={(e) => onSelectScenario(e.target.value)}
              style={{ fontWeight: 600, minWidth: '170px' }}
            >
              {scenarios.map((sc) => (
                <option key={sc.name} value={sc.name} style={{ background: '#0a0e17' }}>
                  {sc.name.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Real-time Sim Controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(16, 23, 38, 0.9)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '4px 6px',
          }}>
            <button
              className={`btn ${isSimulating ? 'btn-danger' : 'btn-success'}`}
              onClick={onToggleSimulate}
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              title={isSimulating ? "Pause live streaming simulation" : "Start real-time automated simulation"}
            >
              {isSimulating ? <Pause size={14} /> : <Play size={14} />}
              <span>{isSimulating ? 'Streaming...' : 'Auto Stream'}</span>
            </button>

            <button
              className="btn btn-secondary"
              onClick={onTriggerStep}
              disabled={isSimulating}
              style={{ padding: '6px 10px', fontSize: '0.8rem' }}
              title="Execute a single simulation step"
            >
              <SkipForward size={14} />
              <span>Step</span>
            </button>
          </div>

          {/* WebSocket Status Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 10px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(0, 0, 0, 0.25)',
            border: '1px solid var(--border-color)',
            fontSize: '0.75rem',
          }}>
            <span className={`pulse-dot ${wsStatus === 'CONNECTED' ? '' : wsStatus === 'ERROR' ? 'danger' : 'warning'}`} />
            <span style={{ color: wsStatus === 'CONNECTED' ? '#34d399' : '#94a3b8' }}>
              {wsStatus === 'CONNECTED' ? 'Live Telemetry' : wsStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        overflowX: 'auto',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        paddingTop: '8px',
      }}>
        {[
          { id: 'topology', label: 'Topology & Channels', icon: Network },
          { id: 'pipeline', label: 'LangGraph 6-Stage Workflow', icon: Layers },
          { id: 'sandbox', label: 'Decision Engine & Sandbox', icon: Zap },
          { id: 'cost', label: 'Cost Physics & Matrix', icon: BarChart3 },
          { id: 'history', label: 'Audit Log & History', icon: History },
          { id: 'benchmarks', label: 'Datasets & Benchmarks', icon: Database },
        ].map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                border: isActive ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              <IconComponent size={16} color={isActive ? 'var(--accent-cyan)' : 'var(--text-muted)'} />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
