"""
Deterministic Rule-Based Task Classifier.
Provides zero-latency, offline classification based on physical domain thresholds.
"""
from app.ingestion.schemas import (
    TaskProfile,
    TaskClassification,
    IntensityLevel,
    LatencySensitivity,
)


class RuleBasedTaskClassifier:
    """Classifies tasks deterministically according to edge/fog computing domain rules."""

    @classmethod
    def classify(cls, task: TaskProfile) -> TaskClassification:
        gfl = task.workload_gigaflops
        data_mb = task.input_data_size_mb
        deadline = task.deadline_ms
        battery = task.device_context.battery_remaining_pct

        # 1. Compute Intensity
        if gfl < 0.4:
            compute_lvl = IntensityLevel.LOW
            comp_desc = f"Lightweight workload ({gfl} GFLOPs)"
        elif gfl <= 1.0:
            compute_lvl = IntensityLevel.MEDIUM
            comp_desc = f"Moderate processing requirement ({gfl} GFLOPs)"
        else:
            compute_lvl = IntensityLevel.HIGH
            comp_desc = f"High computational demand ({gfl} GFLOPs)"

        # 2. Data Intensity
        if data_mb < 1.0:
            data_lvl = IntensityLevel.LOW
            data_desc = f"low network footprint ({data_mb} MB)"
        elif data_mb <= 5.0:
            data_lvl = IntensityLevel.MEDIUM
            data_desc = f"moderate payload size ({data_mb} MB)"
        else:
            data_lvl = IntensityLevel.HIGH
            data_desc = f"heavy transmission payload ({data_mb} MB)"

        # 3. Latency Sensitivity & Base Weights
        if deadline <= 250.0:
            latency_sens = LatencySensitivity.CRITICAL
            alpha = 0.80
            beta = 0.20
            lat_desc = f"Strict real-time deadline ({deadline} ms)"
        elif deadline <= 1000.0:
            latency_sens = LatencySensitivity.MODERATE
            alpha = 0.55
            beta = 0.45
            lat_desc = f"Moderate deadline threshold ({deadline} ms)"
        else:
            latency_sens = LatencySensitivity.TOLERANT
            alpha = 0.30
            beta = 0.70
            lat_desc = f"Relaxed deadline tolerance ({deadline} ms)"

        # 4. Low-Battery Adaptation
        # If battery is low (< 25%) and task is not critical latency, prioritize energy
        if battery < 25.0 and latency_sens != LatencySensitivity.CRITICAL:
            alpha = max(0.20, round(alpha - 0.15, 2))
            beta = round(1.0 - alpha, 2)
            battery_note = f" Battery is low ({battery}%), shifting priority towards energy conservation (beta={beta})."
        else:
            battery_note = ""

        rationale = f"{comp_desc} with {data_desc}. {lat_desc} warrants alpha={alpha} and beta={beta}.{battery_note}"

        return TaskClassification(
            task_id=task.task_id,
            compute_intensity=compute_lvl,
            data_intensity=data_lvl,
            latency_sensitivity=latency_sens,
            alpha_latency_weight=alpha,
            beta_energy_weight=beta,
            rationale=rationale,
        )
