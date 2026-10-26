"""
Unit tests for Stage 3: Task Classification (LLM & Rule-Based).
"""
import pytest
from app.ingestion.schemas import (
    TaskProfile,
    DeviceContext,
    IntensityLevel,
    LatencySensitivity,
)
from app.classification.rule_classifier import RuleBasedTaskClassifier
from app.classification.llm_classifier import LLMTaskClassifier
from app.classification.service import TaskClassificationService


def test_rule_classifier_urgent_realtime_task():
    task = TaskProfile(
        task_id="CLS_URGENT_01",
        task_type="realtime_video_analytics",
        workload_gigaflops=0.85,
        input_data_size_mb=2.4,
        output_data_size_mb=0.2,
        deadline_ms=120.0,
        device_context=DeviceContext(battery_remaining_pct=80.0)
    )

    cls_res = RuleBasedTaskClassifier.classify(task)

    assert cls_res.task_id == "CLS_URGENT_01"
    assert cls_res.compute_intensity == IntensityLevel.MEDIUM
    assert cls_res.data_intensity == IntensityLevel.MEDIUM
    assert cls_res.latency_sensitivity == LatencySensitivity.CRITICAL
    assert cls_res.alpha_latency_weight >= 0.75
    assert abs((cls_res.alpha_latency_weight + cls_res.beta_energy_weight) - 1.0) < 1e-3


def test_rule_classifier_batch_tolerant_task():
    task = TaskProfile(
        task_id="CLS_BATCH_01",
        task_type="smart_meter_telemetry",
        workload_gigaflops=0.15,
        input_data_size_mb=0.3,
        deadline_ms=2500.0,
        device_context=DeviceContext(battery_remaining_pct=75.0)
    )

    cls_res = RuleBasedTaskClassifier.classify(task)

    assert cls_res.compute_intensity == IntensityLevel.LOW
    assert cls_res.data_intensity == IntensityLevel.LOW
    assert cls_res.latency_sensitivity == LatencySensitivity.TOLERANT
    assert cls_res.beta_energy_weight >= 0.65


def test_rule_classifier_low_battery_priority_shift():
    task = TaskProfile(
        task_id="CLS_LOW_BAT_01",
        workload_gigaflops=0.5,
        input_data_size_mb=1.2,
        deadline_ms=600.0,  # Moderate deadline
        device_context=DeviceContext(battery_remaining_pct=14.0)  # Low battery
    )

    cls_res = RuleBasedTaskClassifier.classify(task)

    # Low battery shifts weight towards energy conservation
    assert cls_res.beta_energy_weight >= 0.50
    assert "battery" in cls_res.rationale.lower()


def test_llm_classifier_fallback_behavior():
    # When no API key is provided, LLMTaskClassifier falls back gracefully
    classifier = LLMTaskClassifier(api_key=None)
    task = TaskProfile(
        task_id="CLS_FALLBACK_01",
        workload_gigaflops=1.2,
        input_data_size_mb=6.0,
        deadline_ms=400.0
    )

    res = classifier.classify_task(task)
    assert res.task_id == "CLS_FALLBACK_01"
    assert res.compute_intensity == IntensityLevel.HIGH
    assert res.data_intensity == IntensityLevel.HIGH
    assert res.alpha_latency_weight + res.beta_energy_weight == 1.0


def test_classification_service_caching_and_batch():
    service = TaskClassificationService(use_llm=False)
    tasks = [
        TaskProfile(task_id="BATCH_1", workload_gigaflops=0.2, input_data_size_mb=0.5, deadline_ms=2000.0),
        TaskProfile(task_id="BATCH_2", workload_gigaflops=1.5, input_data_size_mb=3.0, deadline_ms=150.0),
    ]

    results = service.classify_batch(tasks)
    assert len(results) == 2
    assert results[0].task_id == "BATCH_1"
    assert results[1].task_id == "BATCH_2"

    # Second call should retrieve from cache
    cached = service.classify(tasks[0])
    assert cached is results[0]
