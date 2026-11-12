"""Health check router."""
from fastapi import APIRouter
from app.schemas import HealthResponse
from app.services.model_service import model_service
import datetime

router = APIRouter(tags=["Health"])

@router.get("/health", response_model=HealthResponse)
def health_check():
    status = model_service.get_status()
    return HealthResponse(
        status="ok" if status["model_ready"] else "degraded",
        model_ready=status["model_ready"],
        dataset_available=status["dataset_available"],
        model_path=status["model_path"],
        dataset_path=status["dataset_path"],
        timestamp=datetime.datetime.utcnow().isoformat() + "Z",
    )
