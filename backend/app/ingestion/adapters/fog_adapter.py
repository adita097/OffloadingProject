"""
Adapter for Kaggle majdmustafa: Large-Scale Vehicular Fog Computing Dataset.
Handles CPU instruction loads, vehicle deadline constraints, and fog node specifications.
"""
from typing import List, Optional
import os
import pandas as pd
from app.ingestion.adapters.base import BaseDatasetAdapter
from app.ingestion.schemas import TaskProfile, DeviceContext, TierNodeSpec, TierType
from app.ingestion.normalizer import UnitNormalizer


from pathlib import Path

DEFAULT_FOG_CSV = Path(__file__).resolve().parents[3] / "data" / "raw" / "vehicular_fog_tasks.csv"
DEFAULT_FOG_NODES_CSV = Path(__file__).resolve().parents[3] / "data" / "raw" / "vehicular_fog_nodes.csv"


class FogDatasetAdapter(BaseDatasetAdapter):
    """Parses vehicular fog tasks and fog node specifications."""

    def __init__(self, default_file_path: Optional[str] = None):
        super().__init__(str(default_file_path or DEFAULT_FOG_CSV))

    def parse_row(self, row: pd.Series) -> TaskProfile:
        task_id = str(row.get("task_id", "VFT_TASK"))
        
        # Raw computation load (CPU cycles / instructions) -> GigaFLOPs
        raw_load = float(row.get("computation_load", 5e8))
        gigaflops = UnitNormalizer.cycles_to_gigaflops(raw_load)
        
        # Deadline
        deadline_ms = UnitNormalizer.clamp_positive(float(row.get("deadline_ms", 800.0)))
        
        # Input data size estimated from workload if not directly present
        # Typical IoT ratio: ~1.5 - 3 MB per GFLOP
        data_size_mb = round(max(0.2, gigaflops * 1.8), 2)
        
        task_type = UnitNormalizer.infer_task_type(data_size_mb, gigaflops, deadline_ms)

        device_context = DeviceContext(
            device_id=f"Vehicle_OBD_{task_id}",
            device_type="Connected_Vehicle_ECU",
            battery_remaining_pct=90.0,
            local_cpu_ghz=1.8,
            local_power_watts=2.2
        )

        return TaskProfile(
            task_id=f"FOG_{task_id}",
            task_type=task_type,
            workload_gigaflops=gigaflops,
            input_data_size_mb=data_size_mb,
            output_data_size_mb=round(data_size_mb * 0.08, 3),
            deadline_ms=deadline_ms,
            device_context=device_context,
            raw_source="majdmustafa_vehicular_fog_dataset"
        )

    def load_fog_nodes(self, file_path: Optional[str] = None) -> List[TierNodeSpec]:
        """Loads and converts vehicular fog node profiles into unified TierNodeSpec objects."""
        target_path = file_path or str(DEFAULT_FOG_NODES_CSV)
        if not os.path.exists(target_path):
            return []

        df = pd.read_csv(target_path)
        nodes: List[TierNodeSpec] = []
        for _, row in df.iterrows():
            mips = float(row.get("processing_power_mips", 4000.0))
            # 1000 MIPS ~ 1 GFLOP/s at 1 instruction/flop
            capacity_gflops = UnitNormalizer.mips_to_gigaflops(mips)

            node = TierNodeSpec(
                node_id=str(row.get("node_id", "FOG_NODE")),
                tier=TierType.FOG,
                compute_capacity_gigaflops=max(1.0, capacity_gflops),
                active_power_watts=15.0,   # Standard roadside unit / vehicle active power
                idle_power_watts=2.5,
                current_queue_delay_ms=0.0,
                memory_mb=float(row.get("memory_mb", 4096))
            )
            nodes.append(node)
        return nodes
