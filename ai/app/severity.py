from typing import List, Optional

def compute_severity_score(
    hazard_type: str,
    confidence: float,
    bounding_box: List[int],
    frame_width: int = 640,
    frame_height: int = 640,
    speed_kmh: Optional[float] = None
) -> str:
    """
    Configurable severity estimation heuristic based on hazard category,
    detection confidence, proportional area coverage, and vehicle velocity context.

    Note: This is an analytical engineering indicator for municipal prioritization,
    not an officially certified structural engineering standard.
    """
    hazard_weights = {
        "pothole": 35,
        "waterlogging": 30,
        "damaged_surface": 20,
        "crack": 15
    }

    base_score = hazard_weights.get(hazard_type.lower(), 15)

    # Confidence scaling (0 - 25 points)
    conf_score = confidence * 25.0

    # Bounding box relative area footprint (0 - 25 points)
    if len(bounding_box) == 4:
        x1, y1, x2, y2 = bounding_box
        box_area = max(0, x2 - x1) * max(0, y2 - y1)
        total_area = frame_width * frame_height
        area_ratio = min(box_area / max(total_area, 1), 1.0)
        # 10% of frame is considered a massive hazard
        area_score = min(area_ratio / 0.10, 1.0) * 25.0
    else:
        area_score = 10.0

    # Speed factor (0 - 15 points): faster roads mean higher acute risk to traffic
    speed_score = 0.0
    if speed_kmh and speed_kmh > 0:
        speed_score = min(speed_kmh / 80.0, 1.0) * 15.0

    total_score = base_score + conf_score + area_score + speed_score

    if total_score >= 75.0:
        return "critical"
    elif total_score >= 55.0:
        return "high"
    elif total_score >= 35.0:
        return "medium"
    else:
        return "low"
