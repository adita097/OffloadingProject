"""
LLM Decision Explainer using LangChain Structured Outputs.
Generates natural language explanations with automatic fallback to RuleBasedDecisionExplainer.
"""
import os
import logging
from typing import Optional
from app.decision.schemas import OffloadingDecisionRecord
from app.explanation.schemas import ExplanationReport
from app.explanation.prompt import (
    EXPLANATION_SYSTEM_PROMPT,
    build_decision_explanation_user_prompt,
)
from app.explanation.rule_explainer import RuleBasedDecisionExplainer

logger = logging.getLogger(__name__)


class LLMDecisionExplainer:
    """Uses LLM with structured output to explain offloading decisions."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        model_name: Optional[str] = None,
    ):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY") or os.getenv("OPENAI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        self.model_name = model_name
        self._llm = None
        self._init_model()

    def _init_model(self):
        """Initializes LangChain chat model if credentials exist."""
        if not self.api_key:
            return

        try:
            if os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY"):
                from langchain_google_genai import ChatGoogleGenerativeAI
                model = self.model_name or "gemini-1.5-flash"
                self._llm = ChatGoogleGenerativeAI(
                    model=model,
                    google_api_key=self.api_key,
                    temperature=0.2,
                )
            elif os.getenv("OPENAI_API_KEY"):
                from langchain_openai import ChatOpenAI
                model = self.model_name or "gpt-4o-mini"
                self._llm = ChatOpenAI(
                    model=model,
                    api_key=self.api_key,
                    temperature=0.2,
                )
        except Exception as e:
            logger.warning(f"Could not initialize LLM model for explanation: {e}.")
            self._llm = None

    def explain_decision(
        self,
        decision: OffloadingDecisionRecord,
        classification_rationale: str = "Standard offloading workload",
    ) -> ExplanationReport:
        """Explains decision using LLM, or falls back to rule-based synthesizer."""
        if not self._llm:
            return RuleBasedDecisionExplainer.explain(decision)

        # Format candidate table
        candidate_lines = []
        for tier, m in decision.candidate_evaluations.items():
            status = "FEASIBLE" if m.is_feasible else "INFEASIBLE (VIOLATES DEADLINE)"
            candidate_lines.append(
                f"- {tier.value}: Latency={m.total_latency_ms:.1f}ms (Upload: {m.upload_delay_ms:.1f}ms, "
                f"Queue: {m.queue_delay_ms:.1f}ms, Compute: {m.compute_delay_ms:.1f}ms), "
                f"Device Energy={m.device_total_energy_j:.3f}J, Cost Score={m.composite_cost_score:.3f}, Status={status}"
            )
        candidate_breakdown = "\n".join(candidate_lines)

        user_prompt = build_decision_explanation_user_prompt(
            task_id=decision.task_id,
            task_type=decision.task_type,
            selected_tier=decision.selected_tier.value,
            strategy=decision.strategy.value,
            deadline_ms=decision.candidate_evaluations[decision.selected_tier].deadline_ms,
            total_latency_ms=decision.total_latency_ms,
            slack_time_ms=decision.slack_time_ms,
            device_energy_j=decision.device_energy_j,
            composite_cost_score=decision.composite_cost_score,
            trade_off_summary=decision.trade_off.summary,
            candidate_breakdown=candidate_breakdown,
            classification_rationale=classification_rationale,
        )

        try:
            structured_llm = self._llm.with_structured_output(ExplanationReport)
            messages = [
                {"role": "system", "content": EXPLANATION_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ]
            result = structured_llm.invoke(messages)
            if isinstance(result, ExplanationReport):
                return result
            elif isinstance(result, dict):
                return ExplanationReport(**result)
            else:
                return RuleBasedDecisionExplainer.explain(decision)
        except Exception as e:
            logger.warning(f"LLM explanation error: {e}. Falling back to rule synthesizer.")
            return RuleBasedDecisionExplainer.explain(decision)
