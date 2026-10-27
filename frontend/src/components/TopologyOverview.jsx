import React from 'react';
import { 
  Smartphone, 
  Server, 
  Cpu, 
  Cloud, 
  Wifi, 
  Activity, 
  Battery, 
  BatteryCharging, 
  Clock, 
  Zap, 
  AlertTriangle,
  ArrowRight,
  Radio
} from 'lucide-react';

export default function TopologyOverview({ environment, latestDecision }) {
  if (!environment || !environment.tiers) {
    return (
      <div className="glass-panel" style={{ padding: '32px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading topology telemetry...</p>
      </div>
    );
  }

  const { device, tiers, channels, scenario_name, tick } = environment;
  const winnerTier = latestDecision?.selected_tier;

  const getTierColor = (tierKey) => {
    switch (tierKey) {
      case 'LOCAL': return 'var(--tier-local)';
      case 'EDGE': return 'var(--tier-edge)';
      case 'FOG': return 'var(--tier-fog)';
      case 'CLOUD': return 'var(--tier-cloud)';
      default: return 'var(--accent-cyan)';
    }
  };

  const getTierIcon = (tierKey) => {
    switch (tierKey) {
      case 'LOCAL': return Smartphone;
      case 'EDGE': return Radio;
      case 'FOG': return Server;
      case 'CLOUD': return Cloud;
      default: return Cpu;
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner: Scenario overview */}
      <div className="glass-panel" style={{
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        background: 'linear-gradient(90deg, rgba(16, 23, 38, 0.9) 0%, rgba(30, 41, 59, 0.6) 100%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Activity size={20} color="var(--accent-cyan)" />
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Active Environment State
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
              {scenario_name?.replace(/_/g, ' ')}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Device Battery</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
              <Battery size={16} color={device.battery_remaining_pct <= 20 ? '#fb7185' : '#34d399'} />
              <span className="mono" style={{ color: device.battery_remaining_pct <= 20 ? '#fb7185' : '#34d399' }}>
                {device.battery_remaining_pct.toFixed(1)}%
              </span>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Simulation Clock</span>
            <div className="mono" style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>
              Tick {tick}
            </div>
          </div>

          {latestDecision && (
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Last Selected Tier</span>
              <div>
                <span className={`badge badge-${latestDecision.selected_tier.toLowerCase()}`}>
                  {latestDecision.selected_tier}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive 4-Tier Topology Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
      }}>
        {/* Tier Cards: LOCAL, EDGE, FOG, CLOUD */}
        {['LOCAL', 'EDGE', 'FOG', 'CLOUD'].map((tierKey) => {
          const tierData = tiers[tierKey];
          const channelData = channels[tierKey];
          const isWinner = winnerTier === tierKey;
          const tierColor = getTierColor(tierKey);
          const IconComponent = getTierIcon(tierKey);

          return (
            <div
              key={tierKey}
              className="glass-panel"
              style={{
                padding: '20px',
                position: 'relative',
                overflow: 'hidden',
                borderColor: isWinner ? tierColor : 'var(--border-color)',
                boxShadow: isWinner ? `0 0 25px ${tierColor}40` : 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {/* Highlight Ribbon for Last Winner */}
              {isWinner && (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '-32px',
                  background: tierColor,
                  color: '#000000',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '2px 32px',
                  transform: 'rotate(45deg)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                  letterSpacing: '0.05em',
                }}>
                  ACTIVE WINNER
                </div>
              )}

              {/* Card Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: `${tierColor}20`,
                    border: `1px solid ${tierColor}60`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <IconComponent size={20} color={tierColor} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>{tierKey}</h3>
                    <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {tierData ? tierData.node_id : 'N/A'}
                    </span>
                  </div>
                </div>

                <span className={`badge badge-${tierKey.toLowerCase()}`}>
                  {tierKey === 'LOCAL' ? 'On-Device' : tierKey === 'EDGE' ? 'MEC 5G' : tierKey === 'FOG' ? 'Regional' : 'Hyperscale'}
                </span>
              </div>

              {/* Compute Specs */}
              {tierData && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Compute Speed</span>
                    <span className="mono" style={{ fontWeight: 600, color: '#ffffff' }}>
                      {tierData.compute_capacity_gigaflops.toFixed(1)} GFLOPs/s
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Queue Length</span>
                    <span className="mono" style={{ fontWeight: 600, color: tierData.queue_depth_tasks > 5 ? '#fb7185' : '#ffffff' }}>
                      {tierData.queue_depth_tasks} tasks ({tierData.queue_delay_ms.toFixed(1)} ms)
                    </span>
                  </div>

                  {/* Utilization Progress Bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>CPU Utilization</span>
                      <span className="mono" style={{ color: tierData.utilization_pct > 80 ? '#fb7185' : 'var(--text-secondary)' }}>
                        {tierData.utilization_pct.toFixed(1)}%
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '6px',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      borderRadius: '3px',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${Math.min(100, tierData.utilization_pct)}%`,
                        height: '100%',
                        backgroundColor: tierData.utilization_pct > 80 ? '#f43f5e' : tierColor,
                        transition: 'width 0.4s ease',
                      }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Power Profile</span>
                    <span className="mono" style={{ color: 'var(--text-secondary)' }}>
                      Active {tierData.active_power_watts.toFixed(1)}W | Idle {tierData.idle_power_watts.toFixed(2)}W
                    </span>
                  </div>
                </div>
              )}

              {/* Network Channel Telemetry (for offload tiers) */}
              <div style={{
                marginTop: '12px',
                paddingTop: '12px',
                borderTop: '1px solid var(--border-color)',
                fontSize: '0.75rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: 'var(--text-muted)' }}>
                  <Wifi size={14} />
                  <span>Channel to Device</span>
                </div>

                {channelData ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div style={{ background: 'rgba(0,0,0,0.25)', padding: '6px', borderRadius: '4px' }}>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.65rem' }}>Uplink Speed</span>
                      <span className="mono" style={{ fontWeight: 600, color: '#38bdf8' }}>
                        {channelData.uplink_bandwidth_mbps.toFixed(1)} Mbps
                      </span>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.25)', padding: '6px', borderRadius: '4px' }}>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.65rem' }}>Round Trip (RTT)</span>
                      <span className="mono" style={{ fontWeight: 600, color: channelData.rtt_ms > 100 ? '#f59e0b' : '#34d399' }}>
                        {channelData.rtt_ms.toFixed(1)} ms
                      </span>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.25)', padding: '6px', borderRadius: '4px' }}>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.65rem' }}>Downlink Speed</span>
                      <span className="mono" style={{ fontWeight: 600, color: '#a78bfa' }}>
                        {channelData.downlink_bandwidth_mbps.toFixed(1)} Mbps
                      </span>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.25)', padding: '6px', borderRadius: '4px' }}>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.65rem' }}>Packet Loss</span>
                      <span className="mono" style={{ fontWeight: 600, color: channelData.packet_loss_rate > 0.05 ? '#fb7185' : '#94a3b8' }}>
                        {(channelData.packet_loss_rate * 100).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '6px 0' }}>
                    Zero transmission delay (Local on-device bus)
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
