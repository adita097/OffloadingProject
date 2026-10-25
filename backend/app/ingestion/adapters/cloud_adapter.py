"""
Adapter for Kaggle ziya07 / ajithdari: Cloud Task Scheduling Dataset.
Handles cloud VM instructions, memory requirements, and burst network IO.
"""
from typing import Optional
import pandas as pd
from app.ingestion.adapters.base import BaseDatasetAdapter
from app.ingestion.schemas import TaskProfile, DeviceContext
from app.ingestion.normalizer import UnitNormalizer


from pathlib import Path

DEFAULT_CLOUD_CSV = Path(__file__).resolve().parents[3] / "data" / "raw" / "cloud_tasks_ziya.csv"


class CloudDatasetAdapter(BaseDatasetAdapter):
    """Parses cloud task scheduling benchmark logs."""

    def __init__(self, default_file_path: Optional[str] = None):
        super().__init__(str(default_file_path or DEFAULT_CLOUD_CSV))

    def parse_row(self, row: pd.Series) -> TaskProfile:
        task_id = str(row.get("task_id", "CLOUD_TSK"))
        
        # MIPS -> GigaFLOPs
        mips = float(row.get("cpu_usage_mips", 5000.0))
        gigaflops = UnitNormalizer.mips_to_gigaflops(mips)
        
        # Network IO in MB
        data_size_mb = UnitNormalizer.clamp_positive(float(row.get("network_io_mb", 5.0)))
        
        # Deadline
        deadline_ms = UnitNormalizer.clamp_positive(float(row.get("deadline_ms", 2500.0)))
        
        task_type = UnitNormalizer.infer_task_type(data_size_mb, gigaflops, deadline_ms)

        device_context = DeviceContext(
            device_id=f"Client_{task_id}",
            device_type="Enterprise_Gateway",
            battery_remaining_pct=95.0,
            local_cpu_ghz=2.0,
            local_power_watts=2.5
        )

        return TaskProfile(
            task_id=f"CLOUD_{task_id}",
            task_type=task_type,
            workload_gigaflops=gigaflops,
            input_data_size_mb=data_size_mb,
            output_data_size_mb=round(max(0.05, data_size_mb * 0.12), 3),
            deadline_ms=deadline_ms,
            device_context=device_context,
            raw_source="ziya07_cloud_dataset"
        )
