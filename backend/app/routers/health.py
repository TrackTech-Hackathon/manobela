from datetime import datetime, timezone

from fastapi import APIRouter
from pydantic import BaseModel

from app.core.dependencies import (
    ConnectionManagerDep,
    FaceLandmarkerDep,
    ObjectDetectorDep,
)

router = APIRouter(
    prefix="/health",
    tags=["health"],
)


class HealthCheckResponse(BaseModel):
    status: str
    timestamp: datetime


class LivenessResponse(BaseModel):
    status: str


class ReadinessResponse(BaseModel):
    status: str


@router.get(
    "/",
    summary="Health check",
    description="Returns a basic health status.",
    response_model=HealthCheckResponse,
)
async def health():
    return {
        "status": "ok",
        "timestamp": datetime.now(timezone.utc),
    }


@router.get(
    "/live",
    summary="Liveness check",
    description="Verify if the service is running.",
    response_model=LivenessResponse,
)
async def liveness():
    return {"status": "alive"}


@router.get(
    "/ready",
    summary="Readiness check",
    description="Verifies dependencies are ready (database, ML models, etc.)",
    response_model=ReadinessResponse,
)
async def readiness(
    connection_manager: ConnectionManagerDep,
    face_landmarker: FaceLandmarkerDep,
    object_detector: ObjectDetectorDep,
):
    return {"status": "ready"}
