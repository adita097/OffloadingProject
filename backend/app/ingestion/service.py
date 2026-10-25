"""
Ingestion Service: Master Orchestrator for Stage 1.
Loads, normalizes, validates, and serves tasks from all adapters to downstream stages.
"""
from typing import List, Dict, Optional
import os
from pathlib import Path
from app.ingestion.schemas import TaskProfile, TierNodeSpec
from app.ingestion.adapters.edge_adapter import EdgeDatasetAdapter
from app.ingestion.adapters.fog_adapter import FogDatasetAdapter
from app.ingestion.adapters.cloud_adapter import CloudDatasetAdapter
from app.ingestion.adapters.generator import SyntheticScenarioGenerator


class IngestionService:
    """Provides a unified API to access historical benchmarks and live synthetic tasks."""

    def __init__(self, data_root: Optional[str] = None):
        if data_root is None:
            # Default to backend/data/ relative to project structure
            base_dir = Path(__file__).resolve().parent.parent.parent
            self.data_dir = base_dir / "data" / "raw"
        else:
            self.data_dir = Path(data_root)

        self.edge_adapter = EdgeDatasetAdapter(str(self.data_dir / "edge_tasks_kadhiravan.csv"))
        self.fog_adapter = FogDatasetAdapter(str(self.data_dir / "vehicular_fog_tasks.csv"))
        self.cloud_adapter = CloudDatasetAdapter(str(self.data_dir / "cloud_tasks_ziya.csv"))

        self._cached_tasks: Dict[str, TaskProfile] = {}

    def load_all_benchmarks(self) -> List[TaskProfile]:
        """Loads tasks from all benchmark CSV sources into a combined pool."""
        all_tasks: List[TaskProfile] = []

        # 1. Edge Dataset
        if os.path.exists(self.edge_adapter.default_file_path):
            all_tasks.extend(self.edge_adapter.load_tasks())

        # 2. Vehicular Fog Dataset
        if os.path.exists(self.fog_adapter.default_file_path):
            all_tasks.extend(self.fog_adapter.load_tasks())

        # 3. Cloud Dataset
        if os.path.exists(self.cloud_adapter.default_file_path):
            all_tasks.extend(self.cloud_adapter.load_tasks())

        for task in all_tasks:
            self._cached_tasks[task.task_id] = task

        return all_tasks

    def get_fog_nodes(self) -> List[TierNodeSpec]:
        """Loads fog infrastructure specifications."""
        node_file = str(self.data_dir / "vehicular_fog_nodes.csv")
        return self.fog_adapter.load_fog_nodes(node_file)

    def get_task(self, task_id: str) -> Optional[TaskProfile]:
        """Retrieves a cached task by its ID."""
        if not self._cached_tasks:
            self.load_all_benchmarks()
        return self._cached_tasks.get(task_id)

    def generate_streaming_batch(self, count: int = 10) -> List[TaskProfile]:
        """Generates realistic synthetic tasks on demand for live scenario testing."""
        tasks = SyntheticScenarioGenerator.generate_batch(count=count)
        for t in tasks:
            self._cached_tasks[t.task_id] = t
        return tasks

    def get_dataset_summary(self) -> Dict[str, float]:
        """Computes summary statistics across all ingested benchmark tasks."""
        tasks = self.load_all_benchmarks()
        if not tasks:
            return {}

        workloads = [t.workload_gigaflops for t in tasks]
        data_sizes = [t.input_data_size_mb for t in tasks]
        deadlines = [t.deadline_ms for t in tasks]

        return {
            "total_tasks_ingested": len(tasks),
            "avg_workload_gigaflops": round(sum(workloads) / len(workloads), 3),
            "max_workload_gigaflops": max(workloads),
            "avg_data_size_mb": round(sum(data_sizes) / len(data_sizes), 3),
            "avg_deadline_ms": round(sum(deadlines) / len(deadlines), 1),
            "min_deadline_ms": min(deadlines),
        }
