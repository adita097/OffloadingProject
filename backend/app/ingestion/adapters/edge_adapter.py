"""
Adapter for Kaggle kadhiravanucet: Edge Computing Task Scheduling Metrics Samples.
Handles FLOPs task sizes, MB payloads, and ms deadlines.
"""
from typing import Optional
import pandas as pd
from app.ingestion.adapters.base import BaseDatasetAdapter
from app.ingestion.schemas import TaskProfile, DeviceContext
from app.ingestion.normalizer import UnitNormalizer


from pathlib import Path

DEFAULT_EDGE_CSV = Path(__file__).resolve().parents[3] / "data" / "raw" / "edge_tasks_kadhiravan.csv"


class EdgeDatasetAdapter(BaseDatasetAdapter):
    """Parses edge computing task benchmark records."""

    def __init__(self, default_file_path: Optional[str] = None):
        super().__init__(str(default_file_path or DEFAULT_EDGE_CSV))

    def parse_row(self, row: pd.Series) -> TaskProfile:
        task_id = str(row.get("Task ID", row.get("task_id", "EDGE_TASK")))
        
        # Raw FLOPs -> GigaFLOPs
        raw_task_size = float(row.get("Task Size", row.get("task_size", 5e8)))
        gigaflops = UnitNormalizer.flops_to_gigaflops(raw_task_size)
        
        # Data size in MB
        data_size_mb = UnitNormalizer.clamp_positive(float(row.get("Data Size", row.get("data_size", 1.0))))
        
        # Deadline in ms
        deadline_ms = UnitNormalizer.clamp_positive(float(row.get("Deadline", row.get("deadline", 1000.0))))
        
        # Infer semantic label
        task_type = UnitNormalizer.infer_task_type(data_size_mb, gigaflops, deadline_ms)

        # Device power info if available in row
        device_power_w = float(row.get("Energy Consumption", 1.8))
        device_context = DeviceContext(
            device_id=f"Edge_Client_{task_id}",
            local_power_watts=round(device_power_w, 2),
            battery_remaining_pct=80.0
        )

        return TaskProfile(
            task_id=f"EDGE_{task_id}",
            task_type=task_type,
            workload_gigaflops=gigaflops,
            input_data_size_mb=data_size_mb,
            output_data_size_mb=round(data_size_mb * 0.1, 3),
            deadline_ms=deadline_ms,
            device_context=device_context,
            raw_source="kadhiravanucet_edge_dataset"
        )
