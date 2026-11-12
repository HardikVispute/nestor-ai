"""Valuation router."""
from fastapi import APIRouter, HTTPException
from app.schemas import PropertyInput, ValuationResponse, ModelNotReadyError
from app.services.model_service import model_service

router = APIRouter(tags=["Valuation"])

@router.post("/valuation", response_model=ValuationResponse)
def run_valuation(payload: PropertyInput):
    if not model_service.is_ready():
        raise HTTPException(
            status_code=503,
            detail=ModelNotReadyError(
                message="Trained model is not available. Please run ML training pipeline first.",
                model_path=model_service.get_status()["model_path"],
                hint="Run `python ml/train.py` to train and save the model, then restart the backend.",
            ).model_dump(),
        )
    try:
        result = model_service.predict(payload)
        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
