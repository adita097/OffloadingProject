"""
Queueing Theory and Server Congestion Simulator (M/M/1 Queue Model).
Models dynamic server backlog, queuing delays, and utilization across computing tiers.
"""
from typing import Dict
from app.ingestion.schemas import TierType
from app.scenario.models import DynamicTierState


class TierQueueSimulator:
    """
    Simulates dynamic server queues using M/M/1 queuing dynamics:
    - Calculates waiting time W_q based on utilization rho = lambda / mu.
    - Decays queues over simulation ticks as servers process jobs.
    """

    BASELINE_CAPACITIES = {
        TierType.LOCAL: {
            "node_id": "Device_Local_Core",
            "capacity_gflops": 1.5,     # Mobile CPU: 1-2 GFLOPs/s
            "active_power_w": 2.2,
            "idle_power_w": 0.25,
            "base_utilization": 20.0,
        },
        TierType.EDGE: {
            "node_id": "Edge_RSU_MEC_01",
            "capacity_gflops": 12.0,    # Edge server / GPU: 10-20 GFLOPs/s
            "active_power_w": 45.0,
            "idle_power_w": 8.0,
            "base_utilization": 30.0,
        },
        TierType.FOG: {
            "node_id": "Fog_Cluster_Gateway",
            "capacity_gflops": 35.0,    # Fog micro-datacenter: 30-50 GFLOPs/s
            "active_power_w": 120.0,
            "idle_power_w": 25.0,
            "base_utilization": 25.0,
        },
        TierType.CLOUD: {
            "node_id": "Cloud_Hyperscale_VM_Cluster",
            "capacity_gflops": 150.0,   # Cloud data center cluster: virtually elastic
            "active_power_w": 350.0,
            "idle_power_w": 80.0,
            "base_utilization": 15.0,
        },
    }

    @classmethod
    def calculate_mm1_queue_delay_ms(
        cls, capacity_gigaflops: float, queued_tasks: int, avg_task_gflops: float = 0.8
    ) -> float:
        """
        Calculates queuing delay (ms) using backlog processing:
        T_queue = (Queued_Workload / Capacity) * 1000 ms.
        For M/M/1 steady-state: W_q = rho / (mu * (1 - rho)).
        """
        if queued_tasks <= 0:
            return 0.0

        total_queued_workload = queued_tasks * avg_task_gflops
        queue_delay_sec = total_queued_workload / capacity_gigaflops
        queue_delay_ms = queue_delay_sec * 1000.0

        return round(queue_delay_ms, 2)

    @classmethod
    def generate_tier_state(
        cls,
        tier: TierType,
        queue_depth: int = 0,
        custom_capacity_gflops: float = None,
        utilization_override: float = None,
    ) -> DynamicTierState:
        """Generates dynamic tier state with queue delay."""
        base = cls.BASELINE_CAPACITIES[tier].copy()
        capacity = custom_capacity_gflops or base["capacity_gflops"]
        utilization = utilization_override if utilization_override is not None else base["base_utilization"]

        # Queuing delay based on queued tasks
        queue_delay = cls.calculate_mm1_queue_delay_ms(capacity, queue_depth)

        return DynamicTierState(
            tier=tier,
            node_id=base["node_id"],
            compute_capacity_gigaflops=capacity,
            active_power_watts=base["active_power_w"],
            idle_power_watts=base["idle_power_w"],
            queue_depth_tasks=queue_depth,
            queue_delay_ms=queue_delay,
            utilization_pct=min(100.0, utilization + (queue_depth * 4.5)),
        )
