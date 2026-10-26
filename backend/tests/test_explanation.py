"""
Unit tests for Stage 6: Decision Explanation.
"""
import pytest
from app.ingestion.schemas import TierType, TaskProfile
from app.scenario.environment import EnvironmentManager
from app.cost_model.cost_engine import CostEngine
from app.decision.selector import DecisionSelector
from app.explanation.rule_explainer import RuleBasedDecisionExplainer
from app.explanation.llm_explainer import LLMDecisionExplainer
from app.explanation.service import ExplanationService


def test_rule_based_explainer_structure():
    env = EnvironmentManager("NOMINAL_5G")
    task = TaskProfile(
        task_id="EXP_TEST_01",
        task_type="iot_periodic_analytics",
        workload_gigaflops=0.5,
        input_data_size_mb=1.2,
        deadline_ms=800.0
    )
    eval_report = CostEngine.evaluate_task(task, env.get_current_state())
    decision = DecisionSelector.select_optimal_tier(eval_report)

    report = RuleBasedDecisionExplainer.explain(decision)

    assert report.decision_id == decision.decision_id
    assert report.task_id == "EXP_TEST_01"
    assert report.selected_tier == decision.selected_tier
    assert len(report.headline) > 10
    assert len(report.executive_summary) > 20
    assert len(report.why_winner_won) > 20
    assert len(report.why_runner_up_lost) > 10
    assert len(report.rejection_reasons) == 3  # The other 3 candidate tiers
    assert report.primary_bottleneck != ""


def test_llm_explainer_fallback_behavior():
    # Fallback when no API key is set
    explainer = LLMDecisionExplainer(api_key=None)
    env = EnvironmentManager("NOMINAL_5G")
    task = TaskProfile(
        task_id="EXP_FALLBACK_01",
        workload_gigaflops=1.0,
        input_data_size_mb=2.0,
        deadline_ms=1000.0
    )
    eval_report = CostEngine.evaluate_task(task, env.get_current_state())
    decision = DecisionSelector.select_optimal_tier(eval_report)

    report = explainer.explain_decision(decision)
    assert report.task_id == "EXP_FALLBACK_01"
    assert report.selected_tier == decision.selected_tier


def test_explanation_service_caching():
    service = ExplanationService(use_llm=False)
    env = EnvironmentManager("NOMINAL_5G")
    task = TaskProfile(task_id="EXP_CACHE_01", workload_gigaflops=0.4, input_data_size_mb=1.0, deadline_ms=700.0)
    eval_report = CostEngine.evaluate_task(task, env.get_current_state())
    decision = DecisionSelector.select_optimal_tier(eval_report)

    rep1 = service.explain(decision)
    rep2 = service.explain(decision)

    assert rep1 is rep2  # Retrieved from cache
