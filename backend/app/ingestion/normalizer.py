"""
Unit Normalization Engine for Stage 1.
Converts heterogeneous metric conventions across datasets into unified standard units:
- GigaFLOPs (10^9 operations)
- Megabytes (MB)
- Milliseconds (ms)
- Megabits per second (Mbps)
"""
import math
from typing import Tuple
from app.ingestion.schemas import IntensityLevel, LatencySensitivity


class UnitNormalizer:
    """Provides deterministic unit conversions with boundary clamping."""

    @staticmethod
    def flops_to_gigaflops(flops: float) -> float:
        """Converts raw floating-point operations to GigaFLOPs (10^9)."""
        val = max(1e-6, float(flops)) / 1e9
        return round(val, 4)

    @staticmethod
    def mips_to_gigaflops(mips: float, instructions_per_flop: float = 1.0) -> float:
        """
        Converts Million Instructions Per Second (MIPS) or Million Instructions (MI)
        to equivalent GigaFLOPs assuming an IPC/instruction conversion factor.
        1 MI = 10^6 instructions = 10^-3 Giga-instructions.
        """
        giga_ops = (max(0.1, float(mips)) * 1e6 * instructions_per_flop) / 1e9
        return round(giga_ops, 4)

    @staticmethod
    def cycles_to_gigaflops(cycles: float, flops_per_cycle: float = 1.0) -> float:
        """Converts CPU clock cycles to GigaFLOPs."""
        giga_ops = (max(1.0, float(cycles)) * flops_per_cycle) / 1e9
        return round(giga_ops, 4)

    @staticmethod
    def bytes_to_mb(raw_bytes: float) -> float:
        """Converts bytes to Megabytes (MB)."""
        return round(max(0.0001, float(raw_bytes)) / (1024 * 1024), 4)

    @staticmethod
    def kb_to_mb(kb: float) -> float:
        """Converts Kilobytes to Megabytes (MB)."""
        return round(max(0.0001, float(kb)) / 1024.0, 4)

    @staticmethod
    def gb_to_mb(gb: float) -> float:
        """Converts Gigabytes to Megabytes (MB)."""
        return round(max(0.0001, float(gb)) * 1024.0, 4)

    @staticmethod
    def seconds_to_ms(seconds: float) -> float:
        """Converts seconds to milliseconds."""
        return round(max(0.1, float(seconds)) * 1000.0, 2)

    @staticmethod
    def clamp_positive(val: float, min_val: float = 0.001) -> float:
        """Clamps numbers to prevent divide-by-zero or non-physical negative numbers."""
        if math.isnan(val) or math.isinf(val) or val < min_val:
            return min_val
        return float(val)

    @staticmethod
    def infer_task_type(data_size_mb: float, gigaflops: float, deadline_ms: float) -> str:
        """
        Infers an intuitive semantic task label from numerical characteristics.
        Useful for feeding human-readable context to the Stage 3 LLM.
        """
        if deadline_ms <= 200.0:
            if data_size_mb > 2.0:
                return "realtime_video_analytics"
            return "emergency_sensor_alarm"
        elif gigaflops > 1.0 and data_size_mb > 5.0:
            return "distributed_deep_learning"
        elif gigaflops > 0.8:
            return "heavy_cryptographic_verification"
        elif data_size_mb > 10.0:
            return "bulk_telemetry_upload"
        else:
            return "iot_periodic_analytics"

    @classmethod
    def rule_based_classification_heuristic(
        cls, gigaflops: float, data_size_mb: float, deadline_ms: float
    ) -> Tuple[IntensityLevel, IntensityLevel, LatencySensitivity, float, float]:
        """
        Baseline mathematical rule for validation and fallback when LLM is offline:
        Computes (compute_intensity, data_intensity, latency_sensitivity, alpha, beta).
        """
        # Compute Intensity
        if gigaflops < 0.4:
            compute_lvl = IntensityLevel.LOW
        elif gigaflops <= 1.0:
            compute_lvl = IntensityLevel.MEDIUM
        else:
            compute_lvl = IntensityLevel.HIGH

        # Data Intensity
        if data_size_mb < 1.0:
            data_lvl = IntensityLevel.LOW
        elif data_size_mb <= 5.0:
            data_lvl = IntensityLevel.MEDIUM
        else:
            data_lvl = IntensityLevel.HIGH

        # Latency Sensitivity
        if deadline_ms <= 250.0:
            latency_sens = LatencySensitivity.CRITICAL
            alpha = 0.80
            beta = 0.20
        elif deadline_ms <= 1000.0:
            latency_sens = LatencySensitivity.MODERATE
            alpha = 0.55
            beta = 0.45
        else:
            latency_sens = LatencySensitivity.TOLERANT
            alpha = 0.30
            beta = 0.70

        return compute_lvl, data_lvl, latency_sens, alpha, beta
