"""
Unit tests for Stage 2: Scenario Construction Layer.
"""
import pytest
from app.ingestion.schemas import TierType, TaskProfile
from app.scenario.models import DynamicTierState, DynamicChannelState, EnvironmentState
from app.scenario.channel import ChannelSimulator
from app.scenario.queue_model import TierQueueSimulator
from app.scenario.presets import SCENARIO_PRESETS
from app.scenario.environment import EnvironmentManager


def test_channel_simulator_baseline():
    edge_channel = ChannelSimulator.generate_channel_state(TierType.EDGE)
    assert edge_channel.tier == TierType.EDGE
    assert edge_channel.uplink_bandwidth_mbps > 50.0
    assert edge_channel.rtt_ms > 0.0

    local_channel = ChannelSimulator.generate_channel_state(TierType.LOCAL)
    assert local_channel.rtt_ms == 0.0
    assert local_channel.packet_loss_rate == 0.0


def test_transmission_delay_calculation():
    # 2 MB at 100 Mbps uplink with 10 ms RTT
    # Tx time = (2 * 8 / 100) * 1000 = 160 ms. Total = 160 + 10 = 170 ms.
    delay = ChannelSimulator.calculate_transmission_delay_ms(
        data_size_mb=2.0, bandwidth_mbps=100.0, rtt_ms=10.0, packet_loss_rate=0.0
    )
    assert delay == 170.0


def test_queue_simulator_mm1():
    # Capacity = 10 GFLOPs/s, Queued = 5 tasks * 0.8 GFLOPs = 4.0 GFLOPs.
    # Delay = (4.0 / 10.0) * 1000 = 400.0 ms.
    delay = TierQueueSimulator.calculate_mm1_queue_delay_ms(
        capacity_gigaflops=10.0, queued_tasks=5, avg_task_gflops=0.8
    )
    assert delay == 400.0

    # 0 queued tasks -> 0 ms delay
    assert TierQueueSimulator.calculate_mm1_queue_delay_ms(10.0, 0) == 0.0


def test_scenario_presets_structure():
    assert "NOMINAL_5G" in SCENARIO_PRESETS
    assert "EDGE_CONGESTION" in SCENARIO_PRESETS
    assert "POOR_WIRELESS_CHANNEL" in SCENARIO_PRESETS
    assert "CRITICAL_BATTERY" in SCENARIO_PRESETS

    for name, p in SCENARIO_PRESETS.items():
        assert "queue_depths" in p
        assert "channel_overrides" in p
        assert p["device_battery_pct"] > 0


def test_environment_manager_initialization():
    env = EnvironmentManager("NOMINAL_5G")
    state = env.get_current_state()
    assert state.scenario_name == "NOMINAL_5G"
    assert TierType.LOCAL in state.tiers
    assert TierType.EDGE in state.tiers
    assert TierType.FOG in state.tiers
    assert TierType.CLOUD in state.tiers
    assert state.device.battery_remaining_pct == 85.0


def test_environment_manager_preset_switching():
    env = EnvironmentManager()
    # Switch to Edge Congestion
    state = env.set_scenario("EDGE_CONGESTION")
    assert state.scenario_name == "EDGE_CONGESTION"
    edge_tier = state.tiers[TierType.EDGE]
    assert edge_tier.queue_depth_tasks >= 10
    assert edge_tier.queue_delay_ms > 500.0


def test_environment_manager_tick_advancement():
    env = EnvironmentManager()
    initial_tick = env.get_current_state().tick
    next_state = env.tick()
    assert next_state.tick == initial_tick + 1


def test_environment_offload_recording_and_battery():
    env = EnvironmentManager()
    initial_battery = env.get_current_state().device.battery_remaining_pct
    task = TaskProfile(
        task_id="TEST_001",
        workload_gigaflops=1.0,
        input_data_size_mb=2.0,
        deadline_ms=500.0
    )
    # Offload to Fog, consuming 15 Joules
    env.record_offload_decision(TierType.FOG, task, energy_consumed_joules=15.0)
    new_battery = env.get_current_state().device.battery_remaining_pct
    assert new_battery < initial_battery
