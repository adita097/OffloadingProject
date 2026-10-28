"""
Decision Service: Master Orchestrator for Stage 5.
Binds Cost Modeling, Decision Algorithm, Environment updates, and Audit Logging.
"""
from typing import List, Optional
from app.ingestion.schemas import TaskProfile
from app.scenario.environment import EnvironmentManager
from app.cost_model.cost_engine import CostEngine
from app.decision.schemas import DecisionStrategy, OffloadingDecisionRecord
from app.decision.selector import DecisionSelector


class DecisionService:
    """Manages offloading decisions, feedback effects on the environment, and history logs."""

    def __init__(self):
        self.decision_history: List[OffloadingDecisionRecord] = []

    def decide_and_execute(
        self,
        task: TaskProfile,
        env_manager: EnvironmentManager,
        alpha_latency: float = 0.60,
        beta_energy: float = 0.40,
        strategy: DecisionStrategy = DecisionStrategy.WEIGHTED_COST_MINIMIZATION,
    ) -> OffloadingDecisionRecord:
        """
        Executes end-to-end offloading decision pipeline:
        1. Evaluates costs across all 4 tiers under current environment state.
        2. Applies algorithmic selection strategy.
        3. Updates environment (battery drain & server queues).
        4. Logs decision record.
        """
        current_env = env_manager.get_current_state()

        # Step 4: Cost Evaluation
        eval_report = CostEngine.evaluate_task(
            task=task,
            env_state=current_env,
            alpha_latency=alpha_latency,
            beta_energy=beta_energy,
        )

        # Step 5: Algorithmic Selection
        decision = DecisionSelector.select_optimal_tier(eval_report, strategy=strategy)

        # Feedback loop to environment: apply queue load & battery depletion
        env_manager.record_offload_decision(
            tier=decision.selected_tier,
            task=task,
            energy_consumed_joules=decision.device_energy_j,
        )

        # Record in history
        self.decision_history.append(decision)

        return decision

    def get_decision_history(self, limit: int = 50) -> List[OffloadingDecisionRecord]:
        """Returns recent decision records."""
        return self.decision_history[-limit:]

    def get_tier_distribution_stats(self) -> dict:
        """Returns statistical distribution of offloading choices made so far."""
        total = len(self.decision_history)
        if total == 0:
            return {
                "total_decisions": 0,
                "counts": {"LOCAL": 0, "EDGE": 0, "FOG": 0, "CLOUD": 0},
                "percentages": {"LOCAL": 0.0, "EDGE": 0.0, "FOG": 0.0, "CLOUD": 0.0},
                "local_pct": 0.0,
                "edge_pct": 0.0,
                "fog_pct": 0.0,
                "cloud_pct": 0.0,
            }

        counts = {"LOCAL": 0, "EDGE": 0, "FOG": 0, "CLOUD": 0}
        for d in self.decision_history:
            tier_str = d.selected_tier.value if hasattr(d.selected_tier, "value") else str(d.selected_tier)
            counts[tier_str] = counts.get(tier_str, 0) + 1

        percentages = {k: round((v / total) * 100, 1) for k, v in counts.items()}
        return {
            "total_decisions": total,
            "counts": counts,
            "percentages": percentages,
            "local_pct": percentages.get("LOCAL", 0.0),
            "edge_pct": percentages.get("EDGE", 0.0),
            "fog_pct": percentages.get("FOG", 0.0),
            "cloud_pct": percentages.get("CLOUD", 0.0),
        }
