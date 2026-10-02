from typing import List, Optional
from pydantic import BaseModel, Field

class PredictResponse(BaseModel):
    hazardType: str = Field(..., description="Detected hazard category (pothole, crack, waterlogging, damaged_surface)")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Inference confidence score")
    boundingBox: List[int] = Field(..., description="[x1, y1, x2, y2] bounding box coordinates")
    severity: str = Field(..., description="Evaluated severity: low, medium, high, critical")
    processingTimeMs: int = Field(..., description="End-to-end processing latency in milliseconds")
    modelVersion: str = Field(default="YOLOv12", description="Model architecture identifier")
    isMock: bool = Field(default=False, description="Flag indicating if inference was produced in Mock/Demo mode")

class MultiPredictResponse(BaseModel):
    detections: List[PredictResponse]
    processingTimeMs: int
    imageWidth: int
    imageHeight: int
    isMock: bool
    modelVersion: str

class ModelInfoResponse(BaseModel):
    modelName: str
    modelVersion: str
    supportedClasses: List[str]
    device: str
    confidenceThreshold: float
    iouThreshold: float
    modelLoaded: bool
    isMockMode: bool
    weightsPath: str

class HealthResponse(BaseModel):
    status: str
    service: str
    modelVersion: str
    device: str
    cudaAvailable: bool
    isMockMode: bool
