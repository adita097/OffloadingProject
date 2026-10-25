"""
Synthetic Scenario Generator.
Generates realistic streaming task workloads calibrated to the statistical distributions
of the Kaggle and IEEE MEC datasets for live simulation.
"""
import random
from typing import List, Optional
from app.ingestion.schemas import TaskProfile, DeviceContext
from app.ingestion.normalizer import UnitNormalizer


class SyntheticScenarioGenerator:
    """Generates synthetic tasks matching empirical real-world distributions."""

    TASK_ARCHETYPES = [
        {
            "name": "autonomous_vision_frame",
            "gigaflops_range": (0.6, 1.2),
            "data_mb_range": (1.8, 4.0),
            "deadline_range": (80.0, 220.0),  # Very tight deadline
            "device_battery_range": (25.0, 95.0),
        },
        {
            "name": "smart_meter_telemetry",
            "gigaflops_range": (0.05, 0.25),
            "data_mb_range": (0.1, 0.8),
            "deadline_range": (800.0, 2500.0), # Tolerant
            "device_battery_range": (15.0, 80.0),
        },
        {
            "name": "audio_nlp_transcription",
            "gigaflops_range": (0.4, 0.9),
            "data_mb_range": (0.8, 2.2),
            "deadline_range": (300.0, 750.0),  # Moderate
            "device_battery_range": (30.0, 90.0),
        },
        {
            "name": "deep_anomaly_training_batch",
            "gigaflops_range": (2.5, 8.0),     # Very compute-heavy
            "data_mb_range": (10.0, 35.0),
            "deadline_range": (2000.0, 6000.0),# Very tolerant
            "device_battery_range": (40.0, 100.0),
        },
    ]

    @classmethod
    def generate_task(cls, task_index: Optional[int] = None) -> TaskProfile:
        """Generates a single realistic task."""
        archetype = random.choice(cls.TASK_ARCHETYPES)
        idx = task_index if task_index is not None else random.randint(1000, 9999)

        gigaflops = round(random.uniform(*archetype["gigaflops_range"]), 3)
        data_mb = round(random.uniform(*archetype["data_mb_range"]), 2)
        deadline = round(random.uniform(*archetype["deadline_range"]), 1)
        battery = round(random.uniform(*archetype["device_battery_range"]), 1)

        device_context = DeviceContext(
            device_id=f"Sim_Device_{idx}",
            device_type=archetype["name"].split("_")[0].capitalize(),
            battery_remaining_pct=battery,
            local_cpu_ghz=round(random.uniform(1.2, 2.4), 2),
            local_power_watts=round(random.uniform(1.4, 2.8), 2),
            idle_power_watts=0.25
        )

        return TaskProfile(
            task_id=f"SYNTH_{idx}",
            task_type=archetype["name"],
            workload_gigaflops=gigaflops,
            input_data_size_mb=data_mb,
            output_data_size_mb=round(max(0.01, data_mb * random.uniform(0.05, 0.15)), 3),
            deadline_ms=deadline,
            device_context=device_context,
            raw_source="synthetic_distribution_generator"
        )

    @classmethod
    def generate_batch(cls, count: int = 20) -> List[TaskProfile]:
        """Generates a batch of synthetic tasks."""
        return [cls.generate_task(task_index=1000 + i) for i in range(count)]
