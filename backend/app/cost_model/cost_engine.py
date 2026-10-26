"""
Master Cost Engine for Stage 4.
Combines Latency and Energy models, normalizes multi-objective metrics,
and evaluates trade-offs across Local, Edge, Fog, and Cloud tiers.
"""
from typing import Dict, Optional
from app.ingestion.schemas import TierType, TaskProfile
from app.scenario.models import EnvironmentState
from app.cost_model.schemas import TierCostMetrics, TaskCostEvaluation
from app.cost_model.latency_model import LatencyModel
from app.cost_model.energy_model import EnergyModel


class CostEngine:
    """Orchestrates mathematical evaluation of all execution tiers for an incoming task."""

    INFEASIBLE_PENALTY = 1000.0

    @classmethod
    def evaluate_task(
        cls,
        task: TaskProfile,
        env_state: EnvironmentState,
        alpha_latency: float = 0.60,
        beta_energy: float = 0.40,
    ) -> TaskCostEvaluation:
        """
        Evaluates a task across all 4 tiers under the current environment state.
        alpha_latency + beta_energy must equal 1.0.
        """
        raw_evaluations: Dict[TierType, dict] = {}
        all_tiers = [TierType.LOCAL, TierType.EDGE, TierType.FOG, TierType.CLOUD]

        # 1. Compute raw latency and energy metrics for all tiers
        for tier in all_tiers:
            tier_state = env_state.tiers[tier]
            channel_state = env_state.channels[tier]

            lat_metrics = LatencyModel.evaluate_tier_latency(task, tier_state, channel_state)
            eng_metrics = EnergyModel.evaluate_tier_energy(task, tier_state, lat_metrics)

            is_feasible = lat_metrics["total_latency_ms"] <= task.deadline_ms

            raw_evaluations[tier] = {
                "node_id": tier_state.node_id,
                "lat": lat_metrics,
                "eng": eng_metrics,
                "is_feasible": is_feasible,
            }

        # 2. Normalize latency and energy across candidates (Min-Max or Scale by Max)
        max_latency = max(raw_evaluations[t]["lat"]["total_latency_ms"] for t in all_tiers)
        max_energy = max(raw_evaluations[t]["eng"]["device_total_energy_j"] for t in all_tiers)

        max_latency = max(max_latency, 1.0)
        max_energy = max(max_energy, 0.001)

        # Battery penalty multiplier for Local execution when battery is under 20%
        battery_pct = env_state.device.battery_remaining_pct
        local_battery_penalty = 1.0
        if battery_pct <= 20.0:
            local_battery_penalty = 1.0 + ((20.0 - battery_pct) / 10.0)

        # 3. Assemble TierCostMetrics with composite scores
        tier_metrics_map: Dict[TierType, TierCostMetrics] = {}
        for tier in all_tiers:
            raw = raw_evaluations[tier]
            lat = raw["lat"]
            eng = raw["eng"]

            norm_lat = round(lat["total_latency_ms"] / max_latency, 4)
            norm_eng = round(eng["device_total_energy_j"] / max_energy, 4)

            # Apply battery penalty if evaluating Local tier
            adjusted_eng = norm_eng * (local_battery_penalty if tier == TierType.LOCAL else 1.0)

            # Composite cost formula: Cost = alpha * norm_latency + beta * norm_energy
            base_cost = (alpha_latency * norm_lat) + (beta_energy * adjusted_eng)
            penalty = 0.0 if raw["is_feasible"] else cls.INFEASIBLE_PENALTY
            composite_score = round(base_cost + penalty, 4)

            tier_metrics_map[tier] = TierCostMetrics(
                tier=tier,
                node_id=raw["node_id"],
                upload_delay_ms=lat["upload_delay_ms"],
                queue_delay_ms=lat["queue_delay_ms"],
                compute_delay_ms=lat["compute_delay_ms"],
                download_delay_ms=lat["download_delay_ms"],
                propagation_rtt_ms=lat["propagation_rtt_ms"],
                total_latency_ms=lat["total_latency_ms"],
                device_tx_energy_j=eng["device_tx_energy_j"],
                device_idle_energy_j=eng["device_idle_energy_j"],
                device_compute_energy_j=eng["device_compute_energy_j"],
                device_rx_energy_j=eng["device_rx_energy_j"],
                device_total_energy_j=eng["device_total_energy_j"],
                infra_energy_j=eng["infra_energy_j"],
                deadline_ms=task.deadline_ms,
                is_feasible=raw["is_feasible"],
                normalized_latency_score=norm_lat,
                normalized_energy_score=norm_eng,
                composite_cost_score=composite_score,
            )

        # 4. Identify best tiers
        feasible_tiers = [t for t in all_tiers if tier_metrics_map[t].is_feasible]
        pool = feasible_tiers if feasible_tiers else all_tiers

        cheapest = min(pool, key=lambda t: tier_metrics_map[t].composite_cost_score)
        fastest = min(all_tiers, key=lambda t: tier_metrics_map[t].total_latency_ms)
        most_efficient = min(all_tiers, key=lambda t: tier_metrics_map[t].device_total_energy_j)

        return TaskCostEvaluation(
            task_id=task.task_id,
            task_type=task.task_type,
            alpha_latency_weight=alpha_latency,
            beta_energy_weight=beta_energy,
            deadline_ms=task.deadline_ms,
            battery_remaining_pct=battery_pct,
            tier_evaluations=tier_metrics_map,
            cheapest_tier=cheapest,
            fastest_tier=fastest,
            most_energy_efficient_tier=most_efficient,
        )
