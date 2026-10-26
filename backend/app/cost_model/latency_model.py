"""
Mathematical Latency Cost Model.
Calculates end-to-end communication, queuing, and compute execution delay across tiers.
"""
from typing import Dict, Any
from app.ingestion.schemas import TierType, TaskProfile
from app.scenario.models import DynamicTierState, DynamicChannelState


class LatencyModel:
    """Computes exact deterministic latency metrics for each computing tier."""

    @staticmethod
    def calculate_compute_delay_ms(workload_gigaflops: float, capacity_gigaflops: float) -> float:
        """
        Pure processing time:
        T_comp = (Workload_GFLOPs / Capacity_GFLOPs_per_sec) * 1000 ms.
        """
        if capacity_gigaflops <= 0:
            return 999999.0
        return round((workload_gigaflops / capacity_gigaflops) * 1000.0, 2)

    @staticmethod
    def calculate_transfer_delay_ms(data_size_mb: float, bandwidth_mbps: float) -> float:
        """
        Network payload transfer duration:
        T_tx = (Data_Size_MB * 8 / Bandwidth_Mbps) * 1000 ms.
        """
        if bandwidth_mbps <= 0:
            return 999999.0
        return round(((data_size_mb * 8.0) / bandwidth_mbps) * 1000.0, 2)

    @classmethod
    def evaluate_tier_latency(
        cls,
        task: TaskProfile,
        tier_state: DynamicTierState,
        channel_state: DynamicChannelState,
    ) -> Dict[str, float]:
        """
        Calculates all latency components for a specific tier:
        T_total = (T_up + T_down + RTT) * (1 + packet_loss) + T_queue + T_comp.
        """
        tier = tier_state.tier

        # 1. Local Tier: zero communication and zero propagation
        if tier == TierType.LOCAL:
            local_capacity = task.device_context.local_cpu_ghz  # roughly 1 GFLOP/GHz baseline
            compute_delay = cls.calculate_compute_delay_ms(task.workload_gigaflops, local_capacity)

            return {
                "upload_delay_ms": 0.0,
                "download_delay_ms": 0.0,
                "propagation_rtt_ms": 0.0,
                "queue_delay_ms": 0.0,
                "compute_delay_ms": compute_delay,
                "total_latency_ms": compute_delay,
            }

        # 2. Remote Tiers (Edge, Fog, Cloud)
        upload_delay = cls.calculate_transfer_delay_ms(
            task.input_data_size_mb, channel_state.uplink_bandwidth_mbps
        )
        download_delay = cls.calculate_transfer_delay_ms(
            task.output_data_size_mb, channel_state.downlink_bandwidth_mbps
        )
        propagation_rtt = channel_state.rtt_ms

        # Account for packet loss retransmissions
        comm_delay = (upload_delay + download_delay + propagation_rtt) * (1.0 + channel_state.packet_loss_rate)

        # Queuing delay at server
        queue_delay = tier_state.queue_delay_ms

        # Compute delay on server hardware
        compute_delay = cls.calculate_compute_delay_ms(
            task.workload_gigaflops, tier_state.compute_capacity_gigaflops
        )

        total_latency = comm_delay + queue_delay + compute_delay

        return {
            "upload_delay_ms": round(upload_delay, 2),
            "download_delay_ms": round(download_delay, 2),
            "propagation_rtt_ms": round(propagation_rtt, 2),
            "queue_delay_ms": round(queue_delay, 2),
            "compute_delay_ms": round(compute_delay, 2),
            "total_latency_ms": round(total_latency, 2),
        }
