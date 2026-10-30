"""
LangGraph Workflow: Stateful Adaptive Offloading Graph.
Orchestrates: Ingested Task -> LLM Classification -> Cost Modeling -> Algorithmic Selection -> Feedback Loop -> LLM Explanation.
"""
from typing import Literal
from langgraph.graph import StateGraph, START, END

from app.ingestion.schemas import TaskProfile, TierType
from app.scenario.environment import EnvironmentManager
from app.scenario.models import EnvironmentState
from app.classification.service import TaskClassificationService
from app.cost_model.cost_engine import CostEngine
from app.decision.selector import DecisionSelector
from app.decision.schemas import DecisionStrategy
from app.explanation.service import ExplanationService
from app.workflow.state import OffloadingAgentState


# Global service instances
classification_service = TaskClassificationService(use_llm=True)
explanation_service = ExplanationService(use_llm=True)


def classify_task_node(state: OffloadingAgentState) -> dict:
    """Stage 3: Classifies task into compute, data, and latency sensitivity levels."""
    task = state["task"]
    classification = classification_service.classify(task)
    return {
        "classification": classification,
        "status": "CLASSIFIED",
    }


def compute_costs_node(state: OffloadingAgentState) -> dict:
    """Stage 4: Mathematically evaluates latency and energy for all 4 candidate tiers."""
    task = state["task"]
    env = state["env_state"]
    cls = state["classification"]

    alpha = cls.alpha_latency_weight if cls else 0.60
    beta = cls.beta_energy_weight if cls else 0.40

    cost_eval = CostEngine.evaluate_task(
        task=task,
        env_state=env,
        alpha_latency=alpha,
        beta_energy=beta,
    )
    return {
        "cost_evaluation": cost_eval,
        "status": "COSTS_EVALUATED",
    }


def make_decision_node(state: OffloadingAgentState) -> dict:
    """Stage 5: Selects the optimal tier using algorithmic constraint optimization."""
    cost_eval = state["cost_evaluation"]
    strategy = state.get("strategy") or DecisionStrategy.WEIGHTED_COST_MINIMIZATION
    decision = DecisionSelector.select_optimal_tier(
        eval_report=cost_eval,
        strategy=strategy,
    )
    return {
        "decision": decision,
        "status": "DECISION_MADE",
    }


def dynamic_reroute_condition(state: OffloadingAgentState) -> Literal["recalculate_costs", "explain_decision"]:
    """
    Conditional Edge: Checks if network or queue conditions shifted significantly,
    triggering an adaptive recalculation feedback loop.
    """
    decision = state.get("decision")
    recalculated = state.get("recalculated", False)

    if not decision or recalculated:
        return "explain_decision"

    # Check if chosen tier suffered a severe queue delay spike (> 800ms)
    chosen_tier = decision.selected_tier
    chosen_metrics = decision.candidate_evaluations[chosen_tier]

    if chosen_metrics.queue_delay_ms >= 800.0 and not chosen_metrics.is_feasible:
        # Conditions degraded -> trigger adaptive feedback loop
        return "recalculate_costs"

    return "explain_decision"


def recalculate_costs_node(state: OffloadingAgentState) -> dict:
    """Feedback Loop Node: Adjusts environment parameters and recalculates costs."""
    decision = state.get("decision")
    updated_env = state["env_state"].model_copy(deep=True)
    reason = "Target tier experienced severe queuing congestion before dispatch."
    if decision:
        congested_tier = decision.selected_tier
        if congested_tier in updated_env.tiers:
            tier_spec = updated_env.tiers[congested_tier]
            tier_spec.queue_delay_ms += 1500.0
            tier_spec.queue_depth_tasks += 15
            tier_spec.utilization_pct = 100.0
            reason = f"Target tier {congested_tier.value} experienced severe queue saturation ({tier_spec.queue_delay_ms:.0f}ms). Adaptively rerouting."

    return {
        "env_state": updated_env,
        "recalculated": True,
        "recalculation_reason": reason,
        "status": "RECALCULATING",
    }


def explain_decision_node(state: OffloadingAgentState) -> dict:
    """Stage 6: Generates natural language justification and rejection reasons."""
    decision = state["decision"]
    cls_rationale = state["classification"].rationale if state.get("classification") else "Standard Task"
    
    explanation = explanation_service.explain(decision, classification_rationale=cls_rationale)
    return {
        "explanation": explanation,
        "status": "COMPLETED",
    }


def build_offloading_graph() -> StateGraph:
    """Constructs and compiles the full LangGraph stateful decision graph."""
    workflow = StateGraph(OffloadingAgentState)

    # 1. Add all functional nodes
    workflow.add_node("classify_task", classify_task_node)
    workflow.add_node("compute_costs", compute_costs_node)
    workflow.add_node("make_decision", make_decision_node)
    workflow.add_node("recalculate_costs", recalculate_costs_node)
    workflow.add_node("explain_decision", explain_decision_node)

    # 2. Add structural edges
    workflow.add_edge(START, "classify_task")
    workflow.add_edge("classify_task", "compute_costs")
    workflow.add_edge("compute_costs", "make_decision")

    # 3. Add conditional edge for adaptive feedback loop
    workflow.add_conditional_edges(
        "make_decision",
        dynamic_reroute_condition,
        {
            "recalculate_costs": "recalculate_costs",
            "explain_decision": "explain_decision",
        },
    )

    # 4. Feedback loop edge: recalculate_costs routes back to compute_costs
    workflow.add_edge("recalculate_costs", "compute_costs")

    # 5. Terminal edge
    workflow.add_edge("explain_decision", END)

    return workflow.compile()


# Pre-compiled graph instance
compiled_offloading_graph = build_offloading_graph()


def execute_offloading_workflow(
    task: TaskProfile,
    env_manager: EnvironmentManager,
    strategy: DecisionStrategy = DecisionStrategy.WEIGHTED_COST_MINIMIZATION,
) -> OffloadingAgentState:
    """
    Executes the complete 6-stage pipeline through LangGraph.
    Returns the final workflow state including task, classification, costs, decision, and explanation.
    """
    initial_state: OffloadingAgentState = {
        "task": task,
        "env_state": env_manager.get_current_state(),
        "strategy": strategy,
        "classification": None,
        "cost_evaluation": None,
        "decision": None,
        "recalculated": False,
        "recalculation_reason": None,
        "explanation": None,
        "status": "INITIALIZED",
    }

    final_state = compiled_offloading_graph.invoke(initial_state)

    # Apply decision feedback to environment manager (battery deduction + queue load)
    if final_state.get("decision"):
        decision = final_state["decision"]
        env_manager.record_offload_decision(
            tier=decision.selected_tier,
            task=task,
            energy_consumed_joules=decision.device_energy_j,
        )

    return final_state
