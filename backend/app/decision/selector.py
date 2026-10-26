"""
Algorithmic Offloading Decision Selector.
Implements Pareto-optimal cost minimization, latency-greedy, and energy-greedy strategies.
"""
import uuid
from typing import List, Tuple
from app.ingestion.schemas import TierType
from app.cost_model.schemas import TaskCostEvaluation, TierCostMetrics
from app.decision.schemas import (
    DecisionStrategy,
    TradeOffAnalysis,
    OffloadingDecisionRecord,
)


class DecisionSelector:
    """Deterministic algorithmic decision engine for selecting optimal offloading tiers."""

    @classmethod
    def select_optimal_tier(
        cls,
        eval_report: TaskCostEvaluation,
        strategy: DecisionStrategy = DecisionStrategy.WEIGHTED_COST_MINIMIZATION,
    ) -> OffloadingDecisionRecord:
        """
        Executes tier selection based on mathematical cost evaluations and constraint satisfaction.
        """
        evals = eval_report.tier_evaluations
        all_tiers = list(evals.keys())

        # 1. Filter QoS-feasible tiers (tiers meeting deadline)
        feasible_tiers = [t for t in all_tiers if evals[t].is_feasible]

        # 2. Handle Case A: Feasible tiers exist
        if feasible_tiers:
            is_deadline_met = True

            if strategy == DecisionStrategy.LATENCY_MINIMIZATION:
                sorted_tiers = sorted(feasible_tiers, key=lambda t: evals[t].total_latency_ms)
                reason_code = "MIN_LATENCY_QOS_OPTIMAL"
            elif strategy == DecisionStrategy.ENERGY_MINIMIZATION:
                sorted_tiers = sorted(feasible_tiers, key=lambda t: evals[t].device_total_energy_j)
                reason_code = "MIN_DEVICE_ENERGY_OPTIMAL"
            else:  # WEIGHTED_COST_MINIMIZATION (Default)
                sorted_tiers = sorted(feasible_tiers, key=lambda t: evals[t].composite_cost_score)
                reason_code = "PARETO_WEIGHTED_COST_OPTIMAL"

            winner = sorted_tiers[0]
            runner_up = sorted_tiers[1] if len(sorted_tiers) > 1 else winner

        # 3. Handle Case B: Emergency Fallback - No tier meets the deadline
        else:
            is_deadline_met = False
            # Find tier with smallest deadline overrun
            sorted_tiers = sorted(all_tiers, key=lambda t: evals[t].total_latency_ms)
            winner = sorted_tiers[0]
            runner_up = sorted_tiers[1] if len(sorted_tiers) > 1 else winner
            reason_code = "EMERGENCY_MIN_DEADLINE_OVERRUN"

        winner_metric = evals[winner]
        runner_up_metric = evals[runner_up]

        # 4. Compute Trade-Off Analysis
        lat_delta = round(winner_metric.total_latency_ms - runner_up_metric.total_latency_ms, 2)
        eng_delta = round(winner_metric.device_total_energy_j - runner_up_metric.device_total_energy_j, 4)
        cost_delta = round(winner_metric.composite_cost_score - runner_up_metric.composite_cost_score, 4)

        if winner == runner_up:
            trade_summary = f"{winner.value} is the sole candidate evaluated."
        else:
            speed_note = f"{abs(lat_delta)}ms faster" if lat_delta < 0 else (f"{lat_delta}ms slower" if lat_delta > 0 else "equal latency")
            energy_note = f"{abs(eng_delta):.3f}J lower energy" if eng_delta < 0 else (f"{eng_delta:.3f}J higher energy" if eng_delta > 0 else "equal energy")
            trade_summary = f"{winner.value} selected over {runner_up.value} ({speed_note}, {energy_note})."

        trade_off = TradeOffAnalysis(
            winner_tier=winner,
            runner_up_tier=runner_up,
            latency_delta_ms=lat_delta,
            energy_delta_j=eng_delta,
            cost_score_delta=cost_delta,
            summary=trade_summary,
        )

        slack_time = round(eval_report.deadline_ms - winner_metric.total_latency_ms, 2)

        return OffloadingDecisionRecord(
            decision_id=f"DEC_{uuid.uuid4().hex[:8].upper()}",
            task_id=eval_report.task_id,
            task_type=eval_report.task_type,
            selected_tier=winner,
            strategy=strategy,
            is_deadline_met=is_deadline_met,
            slack_time_ms=slack_time,
            alpha_latency_weight=eval_report.alpha_latency_weight,
            beta_energy_weight=eval_report.beta_energy_weight,
            total_latency_ms=winner_metric.total_latency_ms,
            device_energy_j=winner_metric.device_total_energy_j,
            composite_cost_score=winner_metric.composite_cost_score,
            candidate_evaluations=evals,
            trade_off=trade_off,
            all_feasible_tiers=feasible_tiers,
            decision_reason_code=reason_code,
        )
