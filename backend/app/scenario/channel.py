"""
Network Channel Simulator with Stochastic Noise & Propagation Delay.
Models dynamic wireless (5G / 4G / Wi-Fi) and backhaul links to Edge, Fog, and Cloud.
"""
import random
from typing import Dict
from app.ingestion.schemas import TierType
from app.scenario.models import DynamicChannelState


class ChannelSimulator:
    """Simulates realistic network channel conditions with noise and jitter."""

    # Default baseline network parameters
    BASELINE_PROFILES = {
        TierType.LOCAL: {
            "uplink_mbps": 10000.0,     # Internal memory bus / PCIe (virtually infinite)
            "downlink_mbps": 10000.0,
            "rtt_ms": 0.0,
            "packet_loss_rate": 0.0,
            "signal_dbm": 0.0,
        },
        TierType.EDGE: {
            "uplink_mbps": 120.0,       # 5G NR / Fast mmWave
            "downlink_mbps": 250.0,
            "rtt_ms": 12.0,             # 8-15 ms typical edge RTT
            "packet_loss_rate": 0.002,
            "signal_dbm": -70.0,
        },
        TierType.FOG: {
            "uplink_mbps": 75.0,        # Local Fiber / Sub-6GHz wireless gateway
            "downlink_mbps": 140.0,
            "rtt_ms": 35.0,             # 25-45 ms typical fog RTT
            "packet_loss_rate": 0.005,
            "signal_dbm": -80.0,
        },
        TierType.CLOUD: {
            "uplink_mbps": 45.0,        # WAN / Backhaul internet uplink
            "downlink_mbps": 100.0,
            "rtt_ms": 110.0,            # 80-150 ms typical remote cloud RTT
            "packet_loss_rate": 0.010,
            "signal_dbm": -90.0,
        },
    }

    @classmethod
    def generate_channel_state(
        cls, tier: TierType, noise_factor: float = 0.1, custom_overrides: dict = None
    ) -> DynamicChannelState:
        """
        Generates an instantaneous channel state with stochastic jitter.
        noise_factor: 0.1 means +/- 10% gaussian variance.
        """
        base = cls.BASELINE_PROFILES[tier].copy()
        if custom_overrides:
            base.update(custom_overrides)

        if tier == TierType.LOCAL:
            return DynamicChannelState(
                tier=tier,
                uplink_bandwidth_mbps=base["uplink_mbps"],
                downlink_bandwidth_mbps=base["downlink_mbps"],
                rtt_ms=0.0,
                packet_loss_rate=0.0,
                signal_strength_dbm=0.0,
            )

        # Apply realistic noise / jitter
        uplink_jitter = random.gauss(1.0, noise_factor)
        rtt_jitter = random.gauss(1.0, noise_factor * 0.8)

        instantaneous_uplink = max(1.0, base["uplink_mbps"] * uplink_jitter)
        instantaneous_downlink = max(2.0, base["downlink_mbps"] * uplink_jitter)
        instantaneous_rtt = max(2.0, base["rtt_ms"] * rtt_jitter)
        instantaneous_loss = min(0.3, max(0.0, base["packet_loss_rate"] * random.uniform(0.8, 1.3)))

        return DynamicChannelState(
            tier=tier,
            uplink_bandwidth_mbps=round(instantaneous_uplink, 2),
            downlink_bandwidth_mbps=round(instantaneous_downlink, 2),
            rtt_ms=round(instantaneous_rtt, 2),
            packet_loss_rate=round(instantaneous_loss, 4),
            signal_strength_dbm=round(base["signal_dbm"] + random.uniform(-3.0, 3.0), 1),
        )

    @staticmethod
    def calculate_transmission_delay_ms(
        data_size_mb: float, bandwidth_mbps: float, rtt_ms: float = 0.0, packet_loss_rate: float = 0.0
    ) -> float:
        """
        Calculates network transmission delay in milliseconds:
        T_tx = (Data_Size_MB * 8 / Bandwidth_Mbps) * 1000 + RTT
        Includes retransmission multiplier: (1 + packet_loss_rate).
        """
        if bandwidth_mbps <= 0:
            return 999999.0

        raw_tx_time_sec = (data_size_mb * 8.0) / bandwidth_mbps
        raw_tx_time_ms = raw_tx_time_sec * 1000.0

        total_delay_ms = (raw_tx_time_ms + rtt_ms) * (1.0 + packet_loss_rate)
        return round(total_delay_ms, 2)
