"""
Unit tests for Stage 4: Mathematical Cost Calculation Engine.
"""
import pytest
from app.ingestion.schemas import TierType, TaskProfile, DeviceContext
from app.scenario.environment import EnvironmentManager
from app.cost_model.latency_model import LatencyModel
from app.cost_model.energy_model import EnergyModel
from app.cost_model.cost_engine import CostEngine


def test_latency_model_formulas():
    # 1.5 GFLOP on 3.0 GFLOP/s capacity = 500.0 ms
    assert LatencyModel.calculate_compute_delay_ms(1.5, 3.0) == 500.0

    # 2.0 MB at 80.0 Mbps = (2.0 * 8 / 80) * 1000 = 200.0 ms
    assert LatencyModel.calculate_transfer_delay_ms(2.0, 80.0) == 200.0


def test_local_tier_latency_has_zero_network():
    env = EnvironmentManager("NOMINAL_5G")
    state = env.get_current_state()

    task = TaskProfile(
        task_id="TEST_LAT_01",
        workload_gigaflops=1.5,
        input_data_size_mb=3.0,
        deadline_ms=1000.0,
        device_context=DeviceContext(local_cpu_ghz=1.5)
    )

    metrics = LatencyModel.evaluate_tier_latency(
        task, state.tiers[TierType.LOCAL], state.channels[TierType.LOCAL]
    )

    assert metrics["upload_delay_ms"] == 0.0
    assert metrics["download_delay_ms"] == 0.0
    assert metrics["propagation_rtt_ms"] == 0.0
    assert metrics["queue_delay_ms"] == 0.0
    assert metrics["compute_delay_ms"] == 1000.0  # 1.5 / 1.5 * 1000
    assert metrics["total_latency_ms"] == 1000.0


def test_energy_model_local_vs_remote():
    env = EnvironmentManager("NOMINAL_5G")
    state = env.get_current_state()

    task = TaskProfile(
        task_id="TEST_ENG_01",
        workload_gigaflops=1.0,
        input_data_size_mb=2.0,
        deadline_ms=1000.0,
        device_context=DeviceContext(local_power_watts=2.0)
    )

    # Local evaluation
    local_lat = LatencyModel.evaluate_tier_latency(task, state.tiers[TierType.LOCAL], state.channels[TierType.LOCAL])
    local_eng = EnergyModel.evaluate_tier_energy(task, state.tiers[TierType.LOCAL], local_lat)

    assert local_eng["device_tx_energy_j"] == 0.0
    assert local_eng["device_idle_energy_j"] == 0.0
    assert local_eng["device_compute_energy_j"] > 0.0
    assert local_eng["device_total_energy_j"] == local_eng["device_compute_energy_j"]

    # Edge evaluation
    edge_lat = LatencyModel.evaluate_tier_latency(task, state.tiers[TierType.EDGE], state.channels[TierType.EDGE])
    edge_eng = EnergyModel.evaluate_tier_energy(task, state.tiers[TierType.EDGE], edge_lat)

    assert edge_eng["device_tx_energy_j"] > 0.0
    assert edge_eng["device_compute_energy_j"] == 0.0
    assert edge_eng["infra_energy_j"] > 0.0


def test_cost_engine_full_evaluation():
    env = EnvironmentManager("NOMINAL_5G")
    state = env.get_current_state()

    task = TaskProfile(
        task_id="TEST_EVAL_01",
        workload_gigaflops=0.8,
        input_data_size_mb=1.5,
        deadline_ms=800.0
    )

    eval_report = CostEngine.evaluate_task(task, state, alpha_latency=0.7, beta_energy=0.3)

    assert eval_report.task_id == "TEST_EVAL_01"
    assert len(eval_report.tier_evaluations) == 4
    for tier in [TierType.LOCAL, TierType.EDGE, TierType.FOG, TierType.CLOUD]:
        m = eval_report.tier_evaluations[tier]
        assert m.normalized_latency_score <= 1.0
        assert m.normalized_energy_score <= 1.0
        assert m.composite_cost_score >= 0.0

    assert eval_report.fastest_tier in [TierType.LOCAL, TierType.EDGE, TierType.FOG, TierType.CLOUD]
    assert eval_report.cheapest_tier in [TierType.LOCAL, TierType.EDGE, TierType.FOG, TierType.CLOUD]


def test_deadline_violation_infeasibility_penalty():
    env = EnvironmentManager("NOMINAL_5G")
    state = env.get_current_state()

    # Impossible 10 ms deadline
    task = TaskProfile(
        task_id="TEST_DEADLINE_01",
        workload_gigaflops=2.0,
        input_data_size_mb=5.0,
        deadline_ms=10.0
    )

    eval_report = CostEngine.evaluate_task(task, state)
    for tier, m in eval_report.tier_evaluations.items():
        assert m.is_feasible is False
        assert m.composite_cost_score >= CostEngine.INFEASIBLE_PENALTY


def test_critical_battery_penalizes_local_execution():
    env = EnvironmentManager("CRITICAL_BATTERY")  # 12% battery
    state = env.get_current_state()

    task = TaskProfile(
        task_id="TEST_BATTERY_01",
        workload_gigaflops=1.5,
        input_data_size_mb=1.0,
        deadline_ms=3000.0
    )

    eval_report = CostEngine.evaluate_task(task, state, alpha_latency=0.2, beta_energy=0.8)
    local_eval = eval_report.tier_evaluations[TierType.LOCAL]
    # Under 12% battery, local execution cost is heavily penalized
    assert local_eval.composite_cost_score > 0.5
