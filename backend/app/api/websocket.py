"""
Real-Time WebSocket Simulation Stream.
Streams live environment telemetry, queuing dynamics, and automatic LangGraph offloading decisions.
"""
import asyncio
import json
import logging
from typing import List, Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.api.routes_scenarios import env_manager
from app.api.routes_benchmarks import ingestion_service
from app.api.routes_offload import decision_service
from app.workflow.graph import execute_offloading_workflow

logger = logging.getLogger(__name__)

router = APIRouter(tags=["WebSocket"])


class SimulationConnectionManager:
    """Manages active WebSocket client connections and broadcasting."""

    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
        self.is_simulating: bool = False
        self.interval_sec: float = 2.5
        self._sim_task: asyncio.Task = None

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        logger.info(f"WebSocket client connected. Total clients: {len(self.active_connections)}")

        # Send initial state snapshot immediately
        await self.send_personal_message(
            {
                "type": "INITIAL_STATE",
                "environment": env_manager.get_current_state().model_dump(),
                "history": [d.model_dump() for d in decision_service.get_decision_history(10)],
                "stats": decision_service.get_tier_distribution_stats(),
                "is_simulating": self.is_simulating,
            },
            websocket,
        )

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)
        logger.info(f"WebSocket client disconnected. Total clients: {len(self.active_connections)}")

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        try:
            await websocket.send_text(json.dumps(message))
        except Exception:
            pass

    async def broadcast(self, message: dict):
        if not self.active_connections:
            return

        dead_sockets = set()
        msg_str = json.dumps(message)
        for connection in self.active_connections:
            try:
                await connection.send_text(msg_str)
            except Exception:
                dead_sockets.add(connection)

        for dead in dead_sockets:
            self.active_connections.discard(dead)

    async def _simulation_loop(self):
        """Asynchronous loop continuously advancing ticks and offloading live tasks."""
        logger.info("Simulation background loop started.")
        while self.is_simulating:
            try:
                # 1. Advance environment tick
                updated_env = env_manager.tick()

                # 2. Generate a synthetic task for this tick
                task = ingestion_service.generate_streaming_batch(count=1)[0]

                # 3. Execute LangGraph pipeline
                workflow_state = execute_offloading_workflow(task=task, env_manager=env_manager)
                if workflow_state.get("decision"):
                    decision_service.decision_history.append(workflow_state["decision"])

                # 4. Broadcast event
                event_payload = {
                    "type": "SIMULATION_STEP",
                    "tick": updated_env.tick,
                    "environment": env_manager.get_current_state().model_dump(),
                    "task": workflow_state["task"].model_dump(),
                    "classification": workflow_state["classification"].model_dump() if workflow_state.get("classification") else None,
                    "decision": workflow_state["decision"].model_dump() if workflow_state.get("decision") else None,
                    "explanation": workflow_state["explanation"].model_dump() if workflow_state.get("explanation") else None,
                    "stats": decision_service.get_tier_distribution_stats(),
                }
                await self.broadcast(event_payload)

            except Exception as e:
                logger.error(f"Error in simulation loop: {e}")

            await asyncio.sleep(self.interval_sec)

    def start_simulation(self, interval_sec: float = 2.5):
        self.interval_sec = max(1.0, interval_sec)
        if not self.is_simulating:
            self.is_simulating = True
            self._sim_task = asyncio.create_task(self._simulation_loop())

    def pause_simulation(self):
        self.is_simulating = False
        if self._sim_task:
            self._sim_task.cancel()
            self._sim_task = None


manager = SimulationConnectionManager()


@router.websocket("/ws/simulation")
async def websocket_simulation_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time telemetry streaming and simulation controls.
    """
    await manager.connect(websocket)
    try:
        while True:
            data_text = await websocket.receive_text()
            try:
                cmd = json.loads(data_text)
                action = cmd.get("action")

                if action == "start":
                    interval = float(cmd.get("interval", 2.5))
                    manager.start_simulation(interval)
                    await manager.broadcast({"type": "STATUS_UPDATE", "is_simulating": True, "interval": interval})

                elif action == "pause":
                    manager.pause_simulation()
                    await manager.broadcast({"type": "STATUS_UPDATE", "is_simulating": False})

                elif action == "trigger_step":
                    # Single manual step
                    env_manager.tick()
                    task = ingestion_service.generate_streaming_batch(count=1)[0]
                    wf = execute_offloading_workflow(task=task, env_manager=env_manager)
                    if wf.get("decision"):
                        decision_service.decision_history.append(wf["decision"])

                    await manager.broadcast({
                        "type": "SIMULATION_STEP",
                        "tick": env_manager.get_current_state().tick,
                        "environment": env_manager.get_current_state().model_dump(),
                        "task": wf["task"].model_dump(),
                        "classification": wf["classification"].model_dump() if wf.get("classification") else None,
                        "decision": wf["decision"].model_dump() if wf.get("decision") else None,
                        "explanation": wf["explanation"].model_dump() if wf.get("explanation") else None,
                        "stats": decision_service.get_tier_distribution_stats(),
                    })

                elif action == "set_scenario":
                    scenario = cmd.get("scenario_name")
                    env_manager.set_scenario(scenario)
                    await manager.broadcast({
                        "type": "SCENARIO_CHANGED",
                        "environment": env_manager.get_current_state().model_dump(),
                    })

            except Exception as e:
                logger.warning(f"Error handling WebSocket message: {e}")

    except WebSocketDisconnect:
        manager.disconnect(websocket)
