"""
Unit and integration tests for FastAPI REST Endpoints.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ONLINE"
    assert "stages" in data
    assert "endpoints" in data


def test_list_scenarios():
    response = client.get("/api/scenarios")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 4
    names = [s["name"] for s in data]
    assert "NOMINAL_5G" in names
    assert "EDGE_CONGESTION" in names


def test_select_scenario_and_current():
    response = client.post("/api/scenarios/select", json={"scenario_name": "EDGE_CONGESTION"})
    assert response.status_code == 200
    data = response.json()
    assert data["scenario_name"] == "EDGE_CONGESTION"

    # Verify current environment returns the updated preset
    curr_resp = client.get("/api/scenarios/current")
    assert curr_resp.status_code == 200
    assert curr_resp.json()["scenario_name"] == "EDGE_CONGESTION"

    # Reset back to nominal
    client.post("/api/scenarios/select", json={"scenario_name": "NOMINAL_5G"})


def test_advance_tick():
    initial = client.get("/api/scenarios/current").json()["tick"]
    response = client.post("/api/scenarios/tick")
    assert response.status_code == 200
    assert response.json()["tick"] == initial + 1


def test_benchmarks_endpoints():
    # 1. List
    list_resp = client.get("/api/benchmarks?limit=5")
    assert list_resp.status_code == 200
    tasks = list_resp.json()
    assert len(tasks) > 0

    # 2. Summary
    sum_resp = client.get("/api/benchmarks/summary")
    assert sum_resp.status_code == 200
    summary = sum_resp.json()
    assert "total_tasks_ingested" in summary

    # 3. Single task
    first_id = tasks[0]["task_id"]
    single_resp = client.get(f"/api/benchmarks/{first_id}")
    assert single_resp.status_code == 200
    assert single_resp.json()["task_id"] == first_id

    # 4. Generate synthetic
    gen_resp = client.post("/api/benchmarks/generate", json={"count": 3})
    assert gen_resp.status_code == 200
    assert len(gen_resp.json()) == 3


def test_offloading_run_custom_and_history():
    # Submit custom task to run LangGraph
    payload = {
        "task_type": "api_test_task",
        "workload_gigaflops": 0.8,
        "input_data_size_mb": 1.5,
        "deadline_ms": 350.0,
    }
    response = client.post("/api/offload/run", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "COMPLETED"
    assert data["decision"] is not None
    assert data["classification"] is not None
    assert data["explanation"] is not None
    assert "headline" in data["explanation"]

    # Verify recorded in history
    hist_resp = client.get("/api/offload/history?limit=10")
    assert hist_resp.status_code == 200
    assert len(hist_resp.json()) >= 1

    # Verify statistics
    stats_resp = client.get("/api/offload/stats")
    assert stats_resp.status_code == 200
    assert stats_resp.json()["total_decisions"] >= 1
