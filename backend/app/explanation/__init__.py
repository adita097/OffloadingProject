"""
Stage 6: Decision Explanation Package
"""
from app.explanation.schemas import ExplanationReport, TierRejectionReason
from app.explanation.prompt import (
    EXPLANATION_SYSTEM_PROMPT,
    build_decision_explanation_user_prompt,
)
from app.explanation.rule_explainer import RuleBasedDecisionExplainer
from app.explanation.llm_explainer import LLMDecisionExplainer
from app.explanation.service import ExplanationService

__all__ = [
    "ExplanationReport",
    "TierRejectionReason",
    "EXPLANATION_SYSTEM_PROMPT",
    "build_decision_explanation_user_prompt",
    "RuleBasedDecisionExplainer",
    "LLMDecisionExplainer",
    "ExplanationService",
]
