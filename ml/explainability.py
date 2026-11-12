"""
NESTOR AI — Model Explainability
Phase 2 implementation.

For tree-based models: use feature importances.
For linear models: use coefficients.
Future: SHAP integration for per-prediction explanations.
"""
import logging

logger = logging.getLogger("nestor.explainability")


def get_feature_importances(model, feature_names: list) -> list[dict]:
    """
    Extract top feature importances from trained model.
    Returns list of { feature, importance, direction } dicts.
    """
    raise NotImplementedError("Phase 2")


def get_comparable_properties(df, input_property: dict, n: int = 5) -> list[dict]:
    """
    Find comparable properties from the dataset using feature similarity.
    Uses cosine similarity on numeric features.
    Returns list of comparable property dicts.
    """
    raise NotImplementedError("Phase 2")
