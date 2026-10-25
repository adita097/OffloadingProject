"""
Pydantic Data Contracts for Tasks, Tier Nodes, Networks, and Classifications.
Unified standard across all heterogeneous dataset inputs.
"""
from enum import Enum
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, model_validator


class TierType(str, Enum):
    LOCAL = "LOCAL"
    EDGE = "EDGE"
    FOG = "FOG"
    CLOUD = "CLOUD"


class IntensityLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class LatencySensitivity(str, Enum):
    CRITICAL = "CRITICAL"   # < 200 ms
    MODERATE = "MODERATE"   # 200 ms - 1000 ms
    TOLERANT = "TOLERANT"   # > 1000 ms


class DeviceContext(BaseModel):
    """Represents the state of the IoT/Mobile end device executing or offloading."""
    device_id: str = Field(default="IoT_Device_01", description="Unique device ID")
    device_type: str = Field(default="Smart_Sensor_Camera", description="Device category")
    battery_remaining_pct: float = Field(ge=0.0, le=100.0, default=85.0, description="Battery level percentage")
    local_cpu_ghz: float = Field(gt=0.0, default=1.5, description="Local processor clock rate")
    local_power_watts: float = Field(gt=0.0, default=1.8, description="Active power consumption when computing locally")
    idle_power_watts: float = Field(ge=0.0, default=0.25, description="Power consumed while waiting for offloaded results")

    @property
    def is_battery_critical(self) -> bool:
        """Flags when device battery is under 20% to avoid heavy local execution."""
        return self.battery_remaining_pct <= 20.0


class TaskProfile(BaseModel):
    """
    Unified task contract ingested from raw heterogeneous datasets.
    Standardized to:
    - Workload: GigaFLOPs (10^9 floating-point operations)
    - Data Sizes: Megabytes (MB)
    - Time/Deadline: Milliseconds (ms)
    """
    task_id: str = Field(..., description="Unique task identifier")
    task_type: str = Field(default="generic_compute", description="Descriptive task type, e.g., object_detection, telemetry")
    workload_gigaflops: float = Field(gt=0.0, description="Computational requirements in GigaFLOPs")
    input_data_size_mb: float = Field(ge=0.0, description="Payload data to be transmitted if offloaded (MB)")
    output_data_size_mb: float = Field(ge=0.0, default=0.1, description="Result data returned to device (MB)")
    deadline_ms: float = Field(gt=0.0, description="Maximum allowable end-to-end response time in ms")
    device_context: DeviceContext = Field(default_factory=DeviceContext, description="Device operational status")
    raw_source: Optional[str] = Field(default=None, description="Originating dataset or generator name")

    @model_validator(mode="after")
    def validate_sizes(self) -> "TaskProfile":
        if self.output_data_size_mb == 0.0 and self.input_data_size_mb > 0:
            # Default response size to 10% of payload if omitted
            self.output_data_size_mb = max(0.01, round(self.input_data_size_mb * 0.1, 3))
        return self


class TierNodeSpec(BaseModel):
    """Specification of an execution tier node (Local, Edge, Fog, Cloud)."""
    node_id: str = Field(..., description="Unique node identifier")
    tier: TierType = Field(..., description="Computing hierarchy tier")
    compute_capacity_gigaflops: float = Field(gt=0.0, description="Processing capacity in GFLOPs/sec")
    active_power_watts: float = Field(ge=0.0, default=0.0, description="Power consumed during computation")
    idle_power_watts: float = Field(ge=0.0, default=0.0, description="Baseline standby power")
    current_queue_delay_ms: float = Field(ge=0.0, default=0.0, description="Queuing delay due to concurrent requests")
    memory_mb: Optional[float] = Field(default=None, description="Available RAM memory")


class NetworkLinkProfile(BaseModel):
    """Network connection profile between the end device and an offload tier."""
    tier: TierType = Field(..., description="Target tier")
    uplink_bandwidth_mbps: float = Field(gt=0.0, description="Upload bandwidth in Mbps")
    downlink_bandwidth_mbps: float = Field(gt=0.0, description="Download bandwidth in Mbps")
    base_rtt_ms: float = Field(ge=0.0, description="Round trip propagation + transmission baseline in ms")
    packet_loss_rate: float = Field(ge=0.0, le=1.0, default=0.001, description="Packet error/drop rate")


class TaskClassification(BaseModel):
    """
    Stage 3 LLM Classification Contract.
    Strictly structures task characteristics for the downstream mathematical cost model.
    """
    task_id: str
    compute_intensity: IntensityLevel
    data_intensity: IntensityLevel
    latency_sensitivity: LatencySensitivity
    alpha_latency_weight: float = Field(ge=0.0, le=1.0, description="Weight of latency in cost function (0.0 - 1.0)")
    beta_energy_weight: float = Field(ge=0.0, le=1.0, description="Weight of energy in cost function (0.0 - 1.0)")
    rationale: str = Field(..., description="Human-interpretable explanation of the classification")

    @model_validator(mode="after")
    def normalize_weights(self) -> "TaskClassification":
        total = self.alpha_latency_weight + self.beta_energy_weight
        if total > 0 and abs(total - 1.0) > 1e-4:
            self.alpha_latency_weight = round(self.alpha_latency_weight / total, 3)
            self.beta_energy_weight = round(1.0 - self.alpha_latency_weight, 3)
        return self
