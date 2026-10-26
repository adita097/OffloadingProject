"""
Explanation Service: Master Orchestrator for Stage 6.
Coordinates decision explanation and explanation audit caching.
"""
from typing import Dict, Optional
from app.decision.schemas import OffloadingDecisionRecord
from app.explanation.schemas import ExplanationReport
from app.explanation.llm_explainer import LLMDecisionExplainer
from app.explanation.rule_explainer import RuleBasedDecisionExplainer


class ExplanationService:
    """Manages natural language explanation generation and caching."""

    def __init__(self, use_llm: bool = True):
        self.use_llm = use_llm
        self.llm_explainer = LLMDecisionExplainer() if use_llm else None
        self._cache: Dict[str, ExplanationReport] = {}

    def explain(
        self,
        decision: OffloadingDecisionRecord,
        classification_rationale: str = "Standard offloading workload",
    ) -> ExplanationReport:
        """Explains an offloading decision using LLM or rule synthesizer."""
        if decision.decision_id in self._cache:
            return self._cache[decision.decision_id]

        if self.use_llm and self.llm_explainer:
            report = self.llm_explainer.explain_decision(decision, classification_rationale)
        else:
            report = RuleBasedDecisionExplainer.explain(decision)

        self._cache[decision.decision_id] = report
        return report
