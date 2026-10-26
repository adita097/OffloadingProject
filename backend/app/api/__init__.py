"""
API Package: REST & WebSocket Endpoints
"""
from app.api.routes_scenarios import router as scenarios_router
from app.api.routes_benchmarks import router as benchmarks_router
from app.api.routes_offload import router as offload_router
from app.api.websocket import router as websocket_router

__all__ = [
    "scenarios_router",
    "benchmarks_router",
    "offload_router",
    "websocket_router",
]
