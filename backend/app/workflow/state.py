"""
LangGraph Workflow State Definition.
Defines the state structure that flows through each node in the LangGraph graph.
"""
from typing import TypedDict, Optional, Dict, Any
from app.ingestion.schemas import TaskProfile, TaskClassification
from app.scenario.models import EnvironmentState
from app.cost_model.schemas import TaskCostEvaluation
from app.decision.schemas import OffloadingDecisionRecord
from app.explanation.schemas import ExplanationReport


class OffloadingAgentState(TypedDict):
    """
    Unified state dictionary for the LangGraph Adaptive Offloading Workflow.
    Passed sequentially through classification, cost calculation, decision, and explanation nodes.
    """
    # Inputs
    task: TaskProfile
    env_state: EnvironmentState
    
    # Stage 3
    classification: Optional[TaskClassification]
    
    # Stage 4
    cost_evaluation: Optional[TaskCostEvaluation]
    
    # Stage 5
    decision: Optional[OffloadingDecisionRecord]
    
    # Feedback & Dynamic Adaptation
    recalculated: bool
    recalculation_reason: Optional[str]
    
    # Stage 6
    explanation: Optional[ExplanationReport]
    
    # Execution status
    status: str
