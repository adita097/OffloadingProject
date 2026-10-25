"""
Unit tests for Stage 1: Data Ingestion and Normalization.
"""
import pytest
from app.ingestion.schemas import (
    TaskProfile,
    DeviceContext,
    TierType,
    IntensityLevel,
    LatencySensitivity,
    TaskClassification,
)
from app.ingestion.normalizer import UnitNormalizer
from app.ingestion.adapters.edge_adapter import EdgeDatasetAdapter
from app.ingestion.adapters.fog_adapter import FogDatasetAdapter
from app.ingestion.adapters.cloud_adapter import CloudDatasetAdapter
from app.ingestion.adapters.generator import SyntheticScenarioGenerator
from app.ingestion.service import IngestionService


def test_unit_normalizer_conversions():
    # 1.0e9 FLOPs -> 1.0 GFLOP
    assert UnitNormalizer.flops_to_gigaflops(1e9) == 1.0
    assert UnitNormalizer.flops_to_gigaflops(5e8) == 0.5

    # 1000 MIPS -> 1.0 GFLOPs
    assert UnitNormalizer.mips_to_gigaflops(1000) == 1.0

    # 1,000,000,000 cycles -> 1.0 GFLOPs
    assert UnitNormalizer.cycles_to_gigaflops(1e9) == 1.0

    # KB to MB
    assert UnitNormalizer.kb_to_mb(1024) == 1.0

    # Seconds to ms
    assert UnitNormalizer.seconds_to_ms(0.5) == 500.0


def test_task_profile_schema_validation():
    task = TaskProfile(
        task_id="TEST_01",
        task_type="object_detection",
        workload_gigaflops=0.85,
        input_data_size_mb=2.5,
        output_data_size_mb=0.25,
        deadline_ms=180.0,
        device_context=DeviceContext(battery_remaining_pct=15.0)
    )
    assert task.task_id == "TEST_01"
    assert task.device_context.is_battery_critical is True
    assert task.output_data_size_mb == 0.25


def test_classification_weight_normalization():
    # If weights don't sum to 1.0, they should normalize automatically
    classification = TaskClassification(
        task_id="TEST_01",
        compute_intensity=IntensityLevel.HIGH,
        data_intensity=IntensityLevel.MEDIUM,
        latency_sensitivity=LatencySensitivity.CRITICAL,
        alpha_latency_weight=0.8,
        beta_energy_weight=0.4,  # Sum = 1.2
        rationale="Urgent vision processing"
    )
    assert abs((classification.alpha_latency_weight + classification.beta_energy_weight) - 1.0) < 0.01


def test_edge_adapter_loading():
    adapter = EdgeDatasetAdapter()
    tasks = adapter.load_tasks()
    assert len(tasks) > 0
    first = tasks[0]
    assert first.task_id.startswith("EDGE_")
    assert first.workload_gigaflops > 0
    assert first.deadline_ms > 0
    assert first.input_data_size_mb > 0


def test_fog_adapter_loading():
    adapter = FogDatasetAdapter()
    tasks = adapter.load_tasks()
    assert len(tasks) > 0
    first = tasks[0]
    assert first.task_id.startswith("FOG_")

    fog_nodes = adapter.load_fog_nodes()
    assert len(fog_nodes) > 0
    assert fog_nodes[0].tier == TierType.FOG


def test_cloud_adapter_loading():
    adapter = CloudDatasetAdapter()
    tasks = adapter.load_tasks()
    assert len(tasks) > 0
    assert tasks[0].task_id.startswith("CLOUD_")


def test_synthetic_generator():
    batch = SyntheticScenarioGenerator.generate_batch(count=5)
    assert len(batch) == 5
    for task in batch:
        assert task.workload_gigaflops > 0
        assert task.deadline_ms > 0
        assert task.device_context.battery_remaining_pct >= 0


def test_ingestion_service_orchestration():
    service = IngestionService()
    all_tasks = service.load_all_benchmarks()
    assert len(all_tasks) >= 20  # Combined edge + fog + cloud samples
    
    summary = service.get_dataset_summary()
    assert summary["total_tasks_ingested"] >= 20
    assert summary["avg_workload_gigaflops"] > 0
    assert summary["avg_deadline_ms"] > 0
