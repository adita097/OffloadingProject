"""
Environment Manager: Master State Machine for Stage 2.
Coordinates dynamic network channels, server queue backlogs, and device battery over time.
"""
from typing import Dict, List, Optional
import datetime
import random
from app.ingestion.schemas import TierType, DeviceContext, TaskProfile
from app.scenario.models import EnvironmentState, DynamicTierState, DynamicChannelState
from app.scenario.channel import ChannelSimulator
from app.scenario.queue_model import TierQueueSimulator
from app.scenario.presets import SCENARIO_PRESETS


class EnvironmentManager:
    """Manages the real-time simulation environment across all 4 tiers."""

    def __init__(self, initial_preset: str = "NOMINAL_5G"):
        self.tick_count = 0
        self.active_preset_name = initial_preset
        self.device = DeviceContext()
        self._current_state = self._build_state(initial_preset)

    def _build_state(self, preset_name: str) -> EnvironmentState:
        """Constructs an EnvironmentState from a scenario preset."""
        preset = SCENARIO_PRESETS.get(preset_name, SCENARIO_PRESETS["NOMINAL_5G"])
        self.active_preset_name = preset_name
        self.device.battery_remaining_pct = preset["device_battery_pct"]

        tiers: Dict[TierType, DynamicTierState] = {}
        channels: Dict[TierType, DynamicChannelState] = {}

        for tier in [TierType.LOCAL, TierType.EDGE, TierType.FOG, TierType.CLOUD]:
            q_depth = preset["queue_depths"].get(tier, 0)
            tiers[tier] = TierQueueSimulator.generate_tier_state(tier=tier, queue_depth=q_depth)

            channel_override = preset["channel_overrides"].get(tier, {})
            channels[tier] = ChannelSimulator.generate_channel_state(
                tier=tier, noise_factor=0.08, custom_overrides=channel_override
            )

        return EnvironmentState(
            tick=self.tick_count,
            scenario_name=preset_name,
            device=self.device,
            tiers=tiers,
            channels=channels,
            timestamp_iso=datetime.datetime.now(datetime.timezone.utc).isoformat(),
        )

    def get_current_state(self) -> EnvironmentState:
        """Returns the current environment state snapshot."""
        return self._current_state

    def set_scenario(self, preset_name: str) -> EnvironmentState:
        """Switches the active operational scenario."""
        if preset_name not in SCENARIO_PRESETS:
            raise ValueError(f"Unknown scenario preset: {preset_name}. Available: {list(SCENARIO_PRESETS.keys())}")
        self._current_state = self._build_state(preset_name)
        return self._current_state

    def tick(self) -> EnvironmentState:
        """
        Advances the simulation clock by 1 tick:
        - Decays completed tasks in queues (FIFO serving).
        - Introduces stochastic channel fluctuations.
        - Returns the updated state.
        """
        self.tick_count += 1
        preset = SCENARIO_PRESETS.get(self.active_preset_name, SCENARIO_PRESETS["NOMINAL_5G"])

        # Update channels with real-time jitter
        for tier in [TierType.EDGE, TierType.FOG, TierType.CLOUD]:
            override = preset["channel_overrides"].get(tier, {})
            self._current_state.channels[tier] = ChannelSimulator.generate_channel_state(
                tier=tier, noise_factor=0.10, custom_overrides=override
            )

        # Decay queues slightly over time (servers process 1 task every few ticks)
        for tier, tier_state in self._current_state.tiers.items():
            if tier != TierType.LOCAL and tier_state.queue_depth_tasks > 0:
                if random.random() < 0.35:  # 35% chance a queued task finishes each tick
                    tier_state.queue_depth_tasks = max(0, tier_state.queue_depth_tasks - 1)
                    tier_state.queue_delay_ms = TierQueueSimulator.calculate_mm1_queue_delay_ms(
                        tier_state.compute_capacity_gigaflops, tier_state.queue_depth_tasks
                    )

        self._current_state.tick = self.tick_count
        self._current_state.timestamp_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
        return self._current_state

    def record_offload_decision(self, tier: TierType, task: TaskProfile, energy_consumed_joules: float):
        """
        Updates the environment based on the agent's routing choice:
        - If offloaded, increments target tier queue temporarily.
        - Deducts energy consumed from device battery.
        """
        # Deduct battery percentage (Rough model: 1 Joule ~ 0.005% of a 20Wh mobile battery)
        battery_drain_pct = energy_consumed_joules * 0.005
        self.device.battery_remaining_pct = max(0.0, round(self.device.battery_remaining_pct - battery_drain_pct, 2))
        self._current_state.device = self.device

        # If offloaded to remote tier, add temporary queue pressure
        if tier != TierType.LOCAL:
            tier_state = self._current_state.tiers[tier]
            tier_state.queue_depth_tasks += 1
            tier_state.queue_delay_ms = TierQueueSimulator.calculate_mm1_queue_delay_ms(
                tier_state.compute_capacity_gigaflops, tier_state.queue_depth_tasks
            )

    @classmethod
    def get_available_presets(cls) -> Dict[str, str]:
        """Returns metadata for all available presets."""
        return {k: v["description"] for k, v in SCENARIO_PRESETS.items()}
