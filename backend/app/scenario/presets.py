"""
Realistic Scenario Presets for Dynamic Evaluation.
Models different environmental operating conditions (Nominal, Congestion, Low Battery, etc.)
"""
from typing import Dict, Any
from app.ingestion.schemas import TierType


SCENARIO_PRESETS: Dict[str, Dict[str, Any]] = {
    "NOMINAL_5G": {
        "description": "Optimal 5G conditions with low queue loads across all tiers.",
        "device_battery_pct": 85.0,
        "queue_depths": {
            TierType.LOCAL: 0,
            TierType.EDGE: 1,
            TierType.FOG: 1,
            TierType.CLOUD: 0,
        },
        "channel_overrides": {
            TierType.EDGE: {"uplink_mbps": 140.0, "rtt_ms": 10.0, "packet_loss_rate": 0.001},
            TierType.FOG: {"uplink_mbps": 80.0, "rtt_ms": 32.0, "packet_loss_rate": 0.003},
            TierType.CLOUD: {"uplink_mbps": 50.0, "rtt_ms": 105.0, "packet_loss_rate": 0.008},
        },
    },

    "EDGE_CONGESTION": {
        "description": "Peak rush-hour traffic: Edge RSU queue is saturated with requests, causing high queuing delay.",
        "device_battery_pct": 75.0,
        "queue_depths": {
            TierType.LOCAL: 0,
            TierType.EDGE: 14,    # Saturated Edge queue (~930ms delay)
            TierType.FOG: 1,
            TierType.CLOUD: 0,
        },
        "channel_overrides": {
            TierType.EDGE: {"uplink_mbps": 65.0, "rtt_ms": 25.0, "packet_loss_rate": 0.015},
            TierType.FOG: {"uplink_mbps": 85.0, "rtt_ms": 30.0, "packet_loss_rate": 0.003},
            TierType.CLOUD: {"uplink_mbps": 50.0, "rtt_ms": 100.0, "packet_loss_rate": 0.005},
        },
    },

    "POOR_WIRELESS_CHANNEL": {
        "description": "IoT device inside a basement/tunnel with poor wireless signal (high packet loss, low uplink).",
        "device_battery_pct": 65.0,
        "queue_depths": {
            TierType.LOCAL: 0,
            TierType.EDGE: 0,
            TierType.FOG: 0,
            TierType.CLOUD: 0,
        },
        "channel_overrides": {
            TierType.EDGE: {"uplink_mbps": 3.5, "rtt_ms": 65.0, "packet_loss_rate": 0.080, "signal_dbm": -108.0},
            TierType.FOG: {"uplink_mbps": 2.0, "rtt_ms": 110.0, "packet_loss_rate": 0.120, "signal_dbm": -115.0},
            TierType.CLOUD: {"uplink_mbps": 1.2, "rtt_ms": 240.0, "packet_loss_rate": 0.150, "signal_dbm": -120.0},
        },
    },

    "CRITICAL_BATTERY": {
        "description": "Device battery is critical (12%). Agent must offload to conserve energy.",
        "device_battery_pct": 12.0,
        "queue_depths": {
            TierType.LOCAL: 0,
            TierType.EDGE: 1,
            TierType.FOG: 1,
            TierType.CLOUD: 0,
        },
        "channel_overrides": {
            TierType.EDGE: {"uplink_mbps": 110.0, "rtt_ms": 14.0, "packet_loss_rate": 0.002},
            TierType.FOG: {"uplink_mbps": 70.0, "rtt_ms": 38.0, "packet_loss_rate": 0.005},
            TierType.CLOUD: {"uplink_mbps": 45.0, "rtt_ms": 115.0, "packet_loss_rate": 0.010},
        },
    },

    "CLOUD_BACKHAUL_BOTTLENECK": {
        "description": "Distant cloud backbone internet congestion causing severe latency penalty (RTT > 280ms).",
        "device_battery_pct": 80.0,
        "queue_depths": {
            TierType.LOCAL: 0,
            TierType.EDGE: 2,
            TierType.FOG: 1,
            TierType.CLOUD: 12,
        },
        "channel_overrides": {
            TierType.EDGE: {"uplink_mbps": 130.0, "rtt_ms": 12.0, "packet_loss_rate": 0.002},
            TierType.FOG: {"uplink_mbps": 85.0, "rtt_ms": 32.0, "packet_loss_rate": 0.004},
            TierType.CLOUD: {"uplink_mbps": 15.0, "rtt_ms": 310.0, "packet_loss_rate": 0.045},
        },
    },
}
