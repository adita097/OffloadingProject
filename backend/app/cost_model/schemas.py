"""
Cost Model Schemas: Data contracts for latency, energy, and total cost evaluations.
"""
from typing import Dict, List, Optional
from pydantic import BaseModel, Field
from app.ingestion.schemas import TierType


class TierCostMetrics(BaseModel):
    """Detailed mathematical breakdown of latency and energy for a single execution tier."""
    tier: TierType
    node_id: str
    
    # Latency Breakdown (milliseconds)
    upload_delay_ms: float = Field(ge=0.0, description="Time to transmit input payload")
    queue_delay_ms: float = Field(ge=0.0, description="Time waiting in tier queue")
    compute_delay_ms: float = Field(ge=0.0, description="Pure execution processing duration")
    download_delay_ms: float = Field(ge=0.0, description="Time to receive output results")
    propagation_rtt_ms: float = Field(ge=0.0, description="Round trip time overhead")
    total_latency_ms: float = Field(ge=0.0, description="Total end-to-end response time")
    
    # Energy Breakdown (Joules)
    device_tx_energy_j: float = Field(ge=0.0, default=0.0, description="Device energy sending data")
    device_idle_energy_j: float = Field(ge=0.0, default=0.0, description="Device energy while waiting")
    device_compute_energy_j: float = Field(ge=0.0, default=0.0, description="Device energy executing locally")
    device_rx_energy_j: float = Field(ge=0.0, default=0.0, description="Device energy receiving result")
    device_total_energy_j: float = Field(ge=0.0, description="Total energy consumed by IoT device")
    infra_energy_j: float = Field(ge=0.0, default=0.0, description="Energy consumed by tier server hardware")
    
    # Constraint & Normalized Cost
    deadline_ms: float
    is_feasible: bool = Field(description="True if total_latency_ms <= deadline_ms")
    normalized_latency_score: float = Field(ge=0.0, default=0.0, description="Latency normalized 0.0 - 1.0")
    normalized_energy_score: float = Field(ge=0.0, default=0.0, description="Energy normalized 0.0 - 1.0")
    composite_cost_score: float = Field(description="alpha * norm_latency + beta * norm_energy (+ penalty if infeasible)")


class TaskCostEvaluation(BaseModel):
    """Comprehensive cost model evaluation across all 4 candidate tiers for a task."""
    task_id: str
    task_type: str
    alpha_latency_weight: float = Field(ge=0.0, le=1.0)
    beta_energy_weight: float = Field(ge=0.0, le=1.0)
    deadline_ms: float
    battery_remaining_pct: float
    tier_evaluations: Dict[TierType, TierCostMetrics]
    cheapest_tier: TierType
    fastest_tier: TierType
    most_energy_efficient_tier: TierType
