import React from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  Cpu, 
  Network, 
  GitCommit, 
  SlidersHorizontal, 
  BarChart2, 
  History as HistoryIcon, 
  Database
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
}) {
  const navTabs = [
    { id: 'topology', label: 'Topology & Channels', icon: Network },
    { id: 'pipeline', label: 'Workflow', icon: GitCommit },
    { id: 'sandbox', label: 'Decision Engine', icon: SlidersHorizontal },
    { id: 'cost', label: 'Cost Analysis', icon: BarChart2 },
    { id: 'history', label: 'Audit History', icon: HistoryIcon },
    { id: 'benchmarks', label: 'Datasets & Benchmarks', icon: Database },
  ];

  return (
    <header style={{
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Top Application Bar */}
      <div style={{
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        borderBottom: '1px solid var(--border-color)',
      }}>
        {/* App Title & Subtitle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-primary)',
          }}>
            <Cpu size={18} />
          </div>
          <div>
            <h1 style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              lineHeight: 1.2,
              letterSpacing: '-0.01em',
            }}>
              Adaptive Offloading Agent
            </h1>
            <p style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              marginTop: '1px',
              fontWeight: 400,
            }}>
              Intelligent task routing across local, edge, fog, and cloud computing.
            </p>
          </div>
        </div>

        {/* Telemetry & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Tick Indicator */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 10px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            fontSize: '0.75rem',
          }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Tick</span>
            <span className="mono" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              #{tick}
            </span>
          </div>

          {/* Scenario Selector */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <select
              className="input-field"
              value={selectedScenario}
              onChange={(e) => onSelectScenario(e.target.value)}
              style={{
                fontWeight: 500,
                minWidth: '160px',
                paddingTop: '5px',
                paddingBottom: '5px',
                fontSize: '0.78rem',
              }}
              title="Active network and environment scenario"
            >
              {scenarios.map((sc) => (
                <option key={sc.name} value={sc.name}>
                  {sc.name.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Simulation Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              className={`btn ${isSimulating ? 'btn-danger' : 'btn-primary'}`}
              onClick={onToggleSimulate}
              style={{ padding: '5px 11px', fontSize: '0.78rem' }}
              title={isSimulating ? "Pause live streaming simulation" : "Start real-time automated simulation"}
            >
              {isSimulating ? <Pause size={13} /> : <Play size={13} />}
              <span>{isSimulating ? 'Pause' : 'Start Simulation'}</span>
            </button>

            <button
              className="btn btn-secondary"
              onClick={onTriggerStep}
              disabled={isSimulating}
              style={{ padding: '5px 10px', fontSize: '0.78rem' }}
              title="Step forward one tick"
            >
              <SkipForward size={13} />
              <span>Step</span>
            </button>
          </div>

          {/* Live Telemetry Status */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 9px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: wsStatus === 'CONNECTED' ? 'var(--status-success-bg)' : 'var(--bg-tertiary)',
            border: `1px solid ${wsStatus === 'CONNECTED' ? 'var(--status-success-border)' : 'var(--border-color)'}`,
            fontSize: '0.75rem',
            fontWeight: 500,
          }}>
            <span className={`pulse-dot ${wsStatus === 'CONNECTED' ? '' : wsStatus === 'ERROR' ? 'danger' : 'warning'}`} />
            <span style={{
              color: wsStatus === 'CONNECTED' ? 'var(--status-success)' : 'var(--text-secondary)',
            }}>
              {wsStatus === 'CONNECTED' ? 'Live Telemetry' : wsStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Horizontal Navigation Tabs */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        overflowX: 'auto',
        backgroundColor: '#FFFFFF',
      }}>
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '10px 14px',
                fontSize: '0.8125rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'color 0.15s ease, border-color 0.15s ease',
                whiteSpace: 'nowrap',
                marginBottom: '-1px',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              <Icon size={15} color={isActive ? 'var(--accent-primary)' : 'var(--text-muted)'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}
