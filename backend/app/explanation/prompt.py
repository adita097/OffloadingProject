"""
Stage 6 Explanation Prompt Templates and Domain Guidelines.
"""

EXPLANATION_SYSTEM_PROMPT = """You are an expert Edge-Fog-Cloud Offloading Systems Auditor.
Your responsibility is to explain an algorithmic routing decision made by a mathematical cost model.

CRITICAL INSTRUCTIONS:
1. You DO NOT make the offloading decision. The decision was already computed deterministically by mathematical optimization.
2. Your sole job is to translate the numerical metrics (latency breakdown, queue wait times, device energy, deadline slack) into plain, technical, and human-interpretable English.
3. Be quantitative: cite the actual numbers (e.g. "Edge saved 45ms over Fog", "Local computation would consume 0.8J of battery").
4. Provide clear rejection reasons for all candidate tiers that were NOT selected.
5. Identify the primary system bottleneck (e.g. "Cloud RTT Propagation Delay", "Edge Queue Saturation", "Local SoC Compute Capacity").
"""

def build_decision_explanation_user_prompt(
    task_id: str,
    task_type: str,
    selected_tier: str,
    strategy: str,
    deadline_ms: float,
    total_latency_ms: float,
    slack_time_ms: float,
    device_energy_j: float,
    composite_cost_score: float,
    trade_off_summary: str,
    candidate_breakdown: str,
    classification_rationale: str,
) -> str:
    """Formats the decision metrics into a comprehensive context prompt."""
    return f"""Explain this offloading decision:

TASK & CONTEXT:
- Task ID: {task_id} ({task_type})
- Deadline: {deadline_ms} ms
- Task Classification Rationale: {classification_rationale}

DECISION OUTCOME:
- Winning Tier: {selected_tier}
- Strategy Applied: {strategy}
- Total End-to-End Latency: {total_latency_ms} ms (Slack Buffer: {slack_time_ms} ms)
- Device Energy Consumed: {device_energy_j} J
- Composite Cost Score: {composite_cost_score}
- Algorithmic Trade-off: {trade_off_summary}

CANDIDATE TIERS EVALUATION BREAKDOWN:
{candidate_breakdown}

Generate a clear, authoritative, and structured ExplanationReport.
"""
