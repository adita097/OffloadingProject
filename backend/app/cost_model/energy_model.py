"""
Mathematical Energy Cost Model.
Calculates energy consumption (Joules) for both end-device battery and infrastructure.
"""
from typing import Dict
from app.ingestion.schemas import TierType, TaskProfile
from app.scenario.models import DynamicTierState


class EnergyModel:
    """Computes exact physical energy dissipation: Energy (J) = Power (W) * Time (s)."""

    # Device Radio Power constants (Watts)
    DEVICE_TX_POWER_WATTS = 1.20    # Wireless transmission power
    DEVICE_RX_POWER_WATTS = 0.80    # Wireless reception power
    DEVICE_IDLE_POWER_WATTS = 0.25  # Standby / waiting power

    @classmethod
    def evaluate_tier_energy(
        cls,
        task: TaskProfile,
        tier_state: DynamicTierState,
        latency_breakdown: Dict[str, float],
    ) -> Dict[str, float]:
        """
        Calculates device and infrastructure energy consumption in Joules:
        E = P * (Time_ms / 1000).
        """
        tier = tier_state.tier

        # 1. Local Tier: End-device executes everything on its local SoC
        if tier == TierType.LOCAL:
            local_power = task.device_context.local_power_watts
            comp_time_sec = latency_breakdown["compute_delay_ms"] / 1000.0
            device_compute_energy = round(local_power * comp_time_sec, 4)

            return {
                "device_tx_energy_j": 0.0,
                "device_idle_energy_j": 0.0,
                "device_compute_energy_j": device_compute_energy,
                "device_rx_energy_j": 0.0,
                "device_total_energy_j": device_compute_energy,
                "infra_energy_j": 0.0,
            }

        # 2. Remote Offloading Tiers (Edge, Fog, Cloud)
        # Device TX Energy: Uploading payload
        upload_time_sec = latency_breakdown["upload_delay_ms"] / 1000.0
        device_tx_energy = round(cls.DEVICE_TX_POWER_WATTS * upload_time_sec, 4)

        # Device Idle Energy: Waiting while server queues and computes
        wait_time_sec = (
            latency_breakdown["queue_delay_ms"]
            + latency_breakdown["compute_delay_ms"]
            + latency_breakdown["propagation_rtt_ms"]
        ) / 1000.0
        device_idle_energy = round(cls.DEVICE_IDLE_POWER_WATTS * wait_time_sec, 4)

        # Device RX Energy: Receiving output results
        download_time_sec = latency_breakdown["download_delay_ms"] / 1000.0
        device_rx_energy = round(cls.DEVICE_RX_POWER_WATTS * download_time_sec, 4)

        device_total_energy = round(device_tx_energy + device_idle_energy + device_rx_energy, 4)

        # Infrastructure Server Energy (Server active power * server compute time)
        server_comp_time_sec = latency_breakdown["compute_delay_ms"] / 1000.0
        infra_energy = round(tier_state.active_power_watts * server_comp_time_sec, 4)

        return {
            "device_tx_energy_j": device_tx_energy,
            "device_idle_energy_j": device_idle_energy,
            "device_compute_energy_j": 0.0,
            "device_rx_energy_j": device_rx_energy,
            "device_total_energy_j": device_total_energy,
            "infra_energy_j": infra_energy,
        }
