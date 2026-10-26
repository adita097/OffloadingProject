"""
Scenario Management REST API Routes.
Allows the frontend to view, switch, and inspect dynamic network/tier states.
"""
from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.scenario.environment import EnvironmentManager
from app.scenario.presets import SCENARIO_PRESETS
from app.scenario.models import EnvironmentState

router = APIRouter(prefix="/api/scenarios", tags=["Scenarios"])

# Shared singleton environment instance across API routes
env_manager = EnvironmentManager("NOMINAL_5G")


class ScenarioSelectionRequest(BaseModel):
    scenario_name: str = Field(..., description="Key of the scenario preset to activate")


class ScenarioItem(BaseModel):
    name: str
    description: str
    is_active: bool
    device_battery_pct: float


@router.get("", response_model=List[ScenarioItem])
def list_scenarios():
    """Returns all available scenario presets and indicates the currently active one."""
    current_state = env_manager.get_current_state()
    active_name = current_state.scenario_name

    items = []
    for name, data in SCENARIO_PRESETS.items():
        items.append(
            ScenarioItem(
                name=name,
                description=data["description"],
                is_active=(name == active_name),
                device_battery_pct=data["device_battery_pct"],
            )
        )
    return items


@router.post("/select", response_model=EnvironmentState)
def select_scenario(req: ScenarioSelectionRequest):
    """Switches the active operational environment scenario."""
    if req.scenario_name not in SCENARIO_PRESETS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid scenario name: {req.scenario_name}. Available: {list(SCENARIO_PRESETS.keys())}",
        )
    return env_manager.set_scenario(req.scenario_name)


@router.get("/current", response_model=EnvironmentState)
def get_current_environment():
    """Returns the live snapshot of all tiers, channels, and device state."""
    return env_manager.get_current_state()


@router.post("/tick", response_model=EnvironmentState)
def advance_simulation_tick():
    """Manually steps the simulation clock forward by one tick."""
    return env_manager.tick()
