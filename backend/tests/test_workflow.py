"""
Unit tests for the complete LangGraph Adaptive Offloading Workflow.
"""
import pytest
from app.ingestion.schemas import TierType, TaskProfile
from app.scenario.environment import EnvironmentManager
from app.workflow.graph import (
    compiled_offloading_graph,
    execute_offloading_workflow,
)


def test_langgraph_graph_structure():
    assert compiled_offloading_graph is not None
    # Verify graph contains our key functional nodes
    node_names = list(compiled_offloading_graph.nodes.keys())
    assert "classify_task" in node_names
    assert "compute_costs" in node_names
    assert "make_decision" in node_names
    assert "explain_decision" in node_names


def test_execute_offloading_workflow_end_to_end():
    env_manager = EnvironmentManager("NOMINAL_5G")
    initial_battery = env_manager.get_current_state().device.battery_remaining_pct

    task = TaskProfile(
        task_id="WORKFLOW_TASK_01",
        task_type="realtime_video_analytics",
        workload_gigaflops=0.85,
        input_data_size_mb=2.4,
        output_data_size_mb=0.2,
        deadline_ms=180.0
    )

    final_state = execute_offloading_workflow(task, env_manager)

    # 1. State Completion
    assert final_state["status"] == "COMPLETED"

    # 2. Stage 3 Classification Populated
    cls = final_state["classification"]
    assert cls is not None
    assert cls.task_id == "WORKFLOW_TASK_01"
    assert cls.alpha_latency_weight + cls.beta_energy_weight == 1.0

    # 3. Stage 4 Cost Evaluation Populated
    costs = final_state["cost_evaluation"]
    assert costs is not None
    assert len(costs.tier_evaluations) == 4

    # 4. Stage 5 Algorithmic Decision Populated
    dec = final_state["decision"]
    assert dec is not None
    assert dec.selected_tier in [TierType.LOCAL, TierType.EDGE, TierType.FOG, TierType.CLOUD]
    assert dec.trade_off is not None

    # 5. Stage 6 Explanation Populated
    exp = final_state["explanation"]
    assert exp is not None
    assert exp.selected_tier == dec.selected_tier
    assert len(exp.headline) > 0
    assert len(exp.rejection_reasons) == 3

    # 6. Environment Feedback Updated
    assert env_manager.get_current_state().device.battery_remaining_pct <= initial_battery


def test_workflow_under_congested_scenario():
    env_manager = EnvironmentManager("EDGE_CONGESTION")
    task = TaskProfile(
        task_id="WORKFLOW_CONGESTED_01",
        workload_gigaflops=0.7,
        input_data_size_mb=1.8,
        deadline_ms=300.0
    )

    final_state = execute_offloading_workflow(task, env_manager)
    assert final_state["status"] == "COMPLETED"
    # Under Edge Congestion, Edge queue is > 800ms, so it should not pick Edge
    decision = final_state["decision"]
    assert decision.selected_tier != TierType.EDGE


def test_workflow_adaptive_recalculation_loop():
    env_manager = EnvironmentManager("NOMINAL_5G")
    # Artificially set Edge queue delay to 850ms to trigger the conditional reroute check
    env_state = env_manager.get_current_state()
    env_state.tiers[TierType.EDGE].queue_delay_ms = 850.0

    task = TaskProfile(
        task_id="RECALC_TASK_01",
        workload_gigaflops=2.0,
        input_data_size_mb=4.0,
        deadline_ms=40.0  # Infeasible deadline that forces fallback evaluation
    )
    final_state = execute_offloading_workflow(task, env_manager)
    assert final_state["status"] == "COMPLETED"
    assert final_state["decision"] is not None
    assert final_state["explanation"] is not None

