import React from 'react';
import { 
  Smartphone, 
  Radio, 
  Server, 
  Cloud, 
  Battery, 
  Activity, 
  Clock, 
  Check, 
  Wifi
} from 'lucide-react';

export default function TopologyOverview({ environment, latestDecision }) {
  if (!environment || !environment.tiers) {
    return (
      <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Loading topology telemetry...</p>
      </div>
    );
  }

  const { device, tiers, channels, scenario_name, tick } = environment;
  const winnerTier = latestDecision?.selected_tier;

  const tierMeta = {
    LOCAL: {
      name: 'Local Device',
      role: 'On-Device',
      icon: Smartphone,
      badgeClass: 'badge-local',
    },
    EDGE: {
      name: 'Edge Server',
      role: 'MEC 5G',
      icon: Radio,
      badgeClass: 'badge-edge',
    },
    FOG: {
      name: 'Fog Gateway',
      role: 'Regional Node',
      icon: Server,
      badgeClass: 'badge-fog',
    },
    CLOUD: {
      name: 'Cloud Data Center',
      role: 'Hyperscale',
      icon: Cloud,
      badgeClass: 'badge-cloud',
    },
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Compact Environment Summary Bar */}
      <div className="card" style={{
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        backgroundColor: '#FFFFFF',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Network Scenario
            </span>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {scenario_name?.replace(/_/g, ' ')}
            </span>
          </div>

          <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-color)' }} />

          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Device Battery
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Battery size={14} color={device.battery_remaining_pct <= 20 ? 'var(--status-error)' : 'var(--status-success)'} />
              <span className="mono" style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: device.battery_remaining_pct <= 20 ? 'var(--status-error)' : 'var(--text-primary)',
              }}>
                {device.battery_remaining_pct.toFixed(1)}%
              </span>
            </div>
          </div>

          <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-color)' }} />

          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Simulation Clock
            </span>
            <span className="mono" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Tick #{tick}
            </span>
          </div>
        </div>

        {latestDecision && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Latest Route:</span>
            <span className={`badge badge-${latestDecision.selected_tier.toLowerCase()}`}>
              {latestDecision.selected_tier}
            </span>
          </div>
        )}
      </div>

      {/* 4-Tier Resource Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
      }}>
        {['LOCAL', 'EDGE', 'FOG', 'CLOUD'].map((tierKey) => {
          const tierData = tiers[tierKey];
          const channelData = channels[tierKey];
          const isWinner = winnerTier === tierKey;
          const meta = tierMeta[tierKey];
          const Icon = meta.icon;

          return (
            <div
              key={tierKey}
              className="card"
              style={{
                padding: '18px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                borderColor: isWinner ? 'var(--accent-primary)' : 'var(--border-color)',
                boxShadow: isWinner ? '0 0 0 1px var(--accent-primary), var(--shadow-sm)' : 'var(--shadow-xs)',
                backgroundColor: '#FFFFFF',
                position: 'relative',
              }}
            >
              {/* Card Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-secondary)',
                  }}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <h3 style={{ fontSize: '0.925rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {meta.name}
                      </h3>
                      {isWinner && (
                        <span style={{
                          fontSize: '0.6875rem',
                          fontWeight: 600,
                          color: 'var(--accent-primary)',
                          backgroundColor: 'var(--accent-subtle)',
                          border: '1px solid var(--accent-subtle-border)',
                          padding: '1px 6px',
                          borderRadius: 'var(--radius-sm)',
                        }}>
                          Active Route
                        </span>
                      )}
                    </div>
                    <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {tierData ? tierData.node_id : 'N/A'}
                    </span>
                  </div>
                </div>

                <span className={`badge ${meta.badgeClass}`}>
                  {meta.role}
                </span>
              </div>

              {/* Compute Metrics */}
              {tierData && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Compute Speed */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Compute Speed</span>
                    <span className="mono" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {tierData.compute_capacity_gigaflops.toFixed(1)} GFLOPs/s
                    </span>
                  </div>

                  {/* Queue Length */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Queue Length</span>
                    <span className="mono" style={{
                      fontWeight: 600,
                      color: tierData.queue_depth_tasks > 5 ? 'var(--status-warning)' : 'var(--text-primary)',
                    }}>
                      {tierData.queue_depth_tasks} tasks ({tierData.queue_delay_ms.toFixed(1)} ms)
                    </span>
                  </div>

                  {/* CPU Utilization Bar */}
                  <div style={{ paddingTop: '2px', paddingBottom: '2px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>CPU Utilization</span>
                      <span className="mono" style={{
                        fontWeight: 600,
                        color: tierData.utilization_pct > 80 ? 'var(--status-error)' : 'var(--text-secondary)',
                      }}>
                        {tierData.utilization_pct.toFixed(1)}%
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '4px',
                      backgroundColor: 'var(--border-color)',
                      borderRadius: '2px',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${Math.min(100, Math.max(0, tierData.utilization_pct))}%`,
                        height: '100%',
                        backgroundColor: tierData.utilization_pct > 80 ? 'var(--status-error)' : 'var(--accent-primary)',
                        transition: 'width 0.3s ease',
                      }} />
                    </div>
                  </div>

                  {/* Power Profile */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Power Profile</span>
                    <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Active {tierData.active_power_watts.toFixed(1)}W · Idle {tierData.idle_power_watts.toFixed(2)}W
                    </span>
                  </div>
                </div>
              )}

              {/* Network Channel Telemetry */}
              <div style={{
                marginTop: 'auto',
                paddingTop: '12px',
                borderTop: '1px solid var(--border-color)',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  marginBottom: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                }}>
                  <Wifi size={13} />
                  <span>Channel Measurements</span>
                </div>

                {channelData ? (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '6px',
                    backgroundColor: 'var(--bg-tertiary)',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                  }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.6875rem' }}>Uplink</span>
                      <span className="mono" style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {channelData.uplink_bandwidth_mbps.toFixed(1)} Mbps
                      </span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.6875rem' }}>Downlink</span>
                      <span className="mono" style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {channelData.downlink_bandwidth_mbps.toFixed(1)} Mbps
                      </span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.6875rem' }}>RTT</span>
                      <span className="mono" style={{
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: channelData.rtt_ms > 100 ? 'var(--status-warning)' : 'var(--text-primary)',
                      }}>
                        {channelData.rtt_ms.toFixed(1)} ms
                      </span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.6875rem' }}>Packet Loss</span>
                      <span className="mono" style={{
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: channelData.packet_loss_rate > 0.05 ? 'var(--status-error)' : 'var(--text-primary)',
                      }}>
                        {(channelData.packet_loss_rate * 100).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    padding: '10px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    textAlign: 'center',
                  }}>
                    Zero transmission delay (Internal bus)
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
