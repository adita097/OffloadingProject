"""
Offloading Execution & History REST API Routes.
Runs the complete 6-stage LangGraph workflow for individual tasks.
"""
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.ingestion.schemas import TaskProfile, DeviceContext
from app.api.routes_scenarios import env_manager
from app.api.routes_benchmarks import ingestion_service
from app.workflow.graph import execute_offloading_workflow
from app.decision.service import DecisionService
from app.decision.schemas import DecisionStrategy

router = APIRouter(prefix="/api/offload", tags=["Offloading"])

# Decision service instance tracking audit history
decision_service = DecisionService()

# Pre-seed initial benchmark decisions so audit history & distribution stats are immediately populated
try:
    _initial_tasks = ingestion_service.load_all_benchmarks()[:6]
    for _t in _initial_tasks:
        _wf = execute_offloading_workflow(task=_t, env_manager=env_manager)
        if _wf.get("decision"):
            decision_service.decision_history.append(_wf["decision"])
except Exception:
    pass


class RunOffloadRequest(BaseModel):
    task_id: Optional[str] = Field(default=None, description="ID of an existing benchmark task to offload")
    # Custom task fields if submitting on-the-fly
    task_type: Optional[str] = Field(default="custom_iot_task", description="Semantic task category")
    workload_gigaflops: Optional[float] = Field(default=None, gt=0.0, description="Workload in GFLOPs")
    input_data_size_mb: Optional[float] = Field(default=None, ge=0.0, description="Payload data in MB")
    output_data_size_mb: Optional[float] = Field(default=0.1, ge=0.0, description="Return data in MB")
    deadline_ms: Optional[float] = Field(default=None, gt=0.0, description="Deadline in ms")
    strategy: Optional[DecisionStrategy] = Field(
        default=DecisionStrategy.WEIGHTED_COST_MINIMIZATION,
        description="Optimization strategy: WEIGHTED_COST_MINIMIZATION, LATENCY_MINIMIZATION, or ENERGY_MINIMIZATION"
    )


@router.post("/run")
def run_offloading_decision(req: RunOffloadRequest):
    """
    Executes the complete 6-stage LangGraph adaptive offloading workflow:
    1. Ingestion / Task resolution
    2. Environment context binding
    3. LLM Task Classification
    4. Deterministic Cost Modeling (Latency & Energy)
    5. Algorithmic Decision Solver
    6. LLM Decision Explanation
    """
    # 1. Resolve task
    if req.task_id:
        task = ingestion_service.get_task(req.task_id)
        if not task:
            raise HTTPException(status_code=404, detail=f"Task ID '{req.task_id}' not found.")
    elif req.workload_gigaflops and req.deadline_ms:
        current_env = env_manager.get_current_state()
        task = TaskProfile(
            task_id=f"CUSTOM_{current_env.tick}",
            task_type=req.task_type or "custom_iot_task",
            workload_gigaflops=req.workload_gigaflops,
            input_data_size_mb=req.input_data_size_mb or 1.0,
            output_data_size_mb=req.output_data_size_mb or 0.1,
            deadline_ms=req.deadline_ms,
            device_context=current_env.device,
            raw_source="custom_api_submission",
        )
    else:
        # Default to a random benchmark task
        all_tasks = ingestion_service.load_all_benchmarks()
        if not all_tasks:
            raise HTTPException(status_code=500, detail="No benchmark tasks available in database.")
        import random
        task = random.choice(all_tasks)

    # 2. Execute through LangGraph workflow
    workflow_state = execute_offloading_workflow(
        task=task,
        env_manager=env_manager,
        strategy=req.strategy or DecisionStrategy.WEIGHTED_COST_MINIMIZATION,
    )

    # 3. Log into decision service history
    if workflow_state.get("decision"):
        decision_service.decision_history.append(workflow_state["decision"])

    return {
        "status": workflow_state["status"],
        "task": workflow_state["task"],
        "classification": workflow_state["classification"],
        "cost_evaluation": workflow_state["cost_evaluation"],
        "decision": workflow_state["decision"],
        "explanation": workflow_state["explanation"],
        "recalculated": workflow_state["recalculated"],
        "recalculation_reason": workflow_state["recalculation_reason"],
        "environment_snapshot": env_manager.get_current_state(),
    }


@router.get("/history")
def get_offloading_history(limit: int = 50):
    """Returns recent offloading decisions with metrics and audit logs."""
    return decision_service.get_decision_history(limit=limit)


@router.get("/stats")
def get_offloading_statistics():
    """Returns historical tier distribution percentages and total offload volume."""
    return decision_service.get_tier_distribution_stats()
