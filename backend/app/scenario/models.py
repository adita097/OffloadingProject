"""
Stage 2: Scenario and Environment State Data Models.
Represents dynamic channel conditions, tier node queuing, and device states at time t.
"""
from typing import Dict, List, Optional
from pydantic import BaseModel, Field
from app.ingestion.schemas import TierType, TierNodeSpec, NetworkLinkProfile, DeviceContext


class DynamicTierState(BaseModel):
    """Live state of a computing tier at a specific simulation tick."""
    tier: TierType
    node_id: str
    compute_capacity_gigaflops: float = Field(gt=0.0, description="Available processing speed (GFLOPs/s)")
    active_power_watts: float = Field(ge=0.0, description="Active power consumption (W)")
    idle_power_watts: float = Field(ge=0.0, description="Standby power (W)")
    queue_depth_tasks: int = Field(ge=0, default=0, description="Number of tasks waiting in queue")
    queue_delay_ms: float = Field(ge=0.0, default=0.0, description="Estimated queuing wait time (ms)")
    utilization_pct: float = Field(ge=0.0, le=100.0, default=10.0, description="Current CPU utilization %")


class DynamicChannelState(BaseModel):
    """Live communication link state between the IoT device and an offloading tier."""
    tier: TierType
    uplink_bandwidth_mbps: float = Field(gt=0.0, description="Current instantaneous upload speed (Mbps)")
    downlink_bandwidth_mbps: float = Field(gt=0.0, description="Current instantaneous download speed (Mbps)")
    rtt_ms: float = Field(ge=0.0, description="Current round-trip propagation delay (ms)")
    packet_loss_rate: float = Field(ge=0.0, le=1.0, default=0.001, description="Packet loss ratio")
    signal_strength_dbm: float = Field(default=-65.0, description="Received signal strength (dBm)")


class EnvironmentState(BaseModel):
    """
    Unified snapshot of the entire multi-tier system at simulation time tick t.
    Passed to Stage 3 (Classification), Stage 4 (Cost Modeling), and Stage 5 (Decision).
    """
    tick: int = Field(default=0, description="Simulation step counter")
    scenario_name: str = Field(default="NOMINAL_5G", description="Active scenario preset name")
    device: DeviceContext = Field(..., description="End device status (battery, local clock)")
    tiers: Dict[TierType, DynamicTierState] = Field(..., description="State of all 4 tiers")
    channels: Dict[TierType, DynamicChannelState] = Field(..., description="Network channels to tiers")
    timestamp_iso: Optional[str] = Field(default=None, description="ISO timestamp")
