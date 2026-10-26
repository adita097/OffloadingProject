"""
Benchmark Datasets & Tasks REST API Routes.
Exposes ingested Kaggle/IEEE benchmark workloads and synthetic generators to the frontend.
"""
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from app.ingestion.service import IngestionService
from app.ingestion.schemas import TaskProfile

router = APIRouter(prefix="/api/benchmarks", tags=["Benchmarks"])

# Shared singleton ingestion service
ingestion_service = IngestionService()


class GenerateTasksRequest(BaseModel):
    count: int = Field(default=10, ge=1, le=100, description="Number of synthetic tasks to generate")


@router.get("", response_model=List[TaskProfile])
def list_benchmark_tasks(
    limit: int = Query(default=50, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
):
    """Returns a list of ingested benchmark tasks from Kaggle & IEEE datasets."""
    all_tasks = ingestion_service.load_all_benchmarks()
    return all_tasks[offset : offset + limit]


@router.get("/summary", response_model=Dict[str, float])
def get_benchmarks_summary():
    """Returns aggregate statistical metrics across all benchmark datasets."""
    return ingestion_service.get_dataset_summary()


@router.get("/{task_id}", response_model=TaskProfile)
def get_task_by_id(task_id: str):
    """Fetches a specific task by its unique identifier."""
    task = ingestion_service.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail=f"Task with ID '{task_id}' not found.")
    return task


@router.post("/generate", response_model=List[TaskProfile])
def generate_synthetic_workload(req: GenerateTasksRequest):
    """Generates synthetic tasks calibrated to empirical real-world distributions."""
    return ingestion_service.generate_streaming_batch(count=req.count)
