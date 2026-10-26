"""
Stage 6: Decision Explanation Schemas.
Data contracts for natural language justification and rejection rationale across tiers.
"""
from typing import Dict, List, Optional
from pydantic import BaseModel, Field
from app.ingestion.schemas import TierType


class TierRejectionReason(BaseModel):
    """Specific explanation of why a non-winning tier was not selected."""
    tier: TierType
    reason: str = Field(description="Concrete reason, e.g., 'Violated 200ms deadline' or 'Excessive transmission delay'")
    trade_off_vs_winner: str = Field(description="Direct comparison against the winning tier")


class ExplanationReport(BaseModel):
    """
    Comprehensive, human-interpretable explanation produced by Stage 6.
    Translates mathematical cost scores into plain English rationale.
    """
    decision_id: str
    task_id: str
    selected_tier: TierType
    headline: str = Field(description="Clear, 1-sentence summary of the decision")
    executive_summary: str = Field(description="2-3 sentence overview of why this tier won")
    why_winner_won: str = Field(description="Detailed analysis of latency and energy benefits")
    why_runner_up_lost: str = Field(description="Specific analysis of what held the runner-up back")
    rejection_reasons: Dict[TierType, TierRejectionReason] = Field(
        description="Detailed rejection rationale for all candidate tiers"
    )
    primary_bottleneck: str = Field(description="Identified system bottleneck, e.g., 'Uplink Bandwidth' or 'Server Queuing'")
    confidence_level: str = Field(default="HIGH", description="Confidence level: HIGH, MEDIUM, or MARGINAL")
