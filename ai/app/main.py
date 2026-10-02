from fastapi import FastAPI, File, UploadFile, Query, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
import torch

from .config import settings
from .schemas import PredictResponse, MultiPredictResponse, ModelInfoResponse, HealthResponse
from .inference import InferencePipeline
from .detector import SUPPORTED_CLASSES

app = FastAPI(
    title="ARHDN Edge AI Inference Service",
    description="Autonomous Road Hazard Detection Network - YOLOv12 Computer Vision Service",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instantiate pipeline on startup
pipeline = InferencePipeline()

@app.get("/health", response_model=HealthResponse)
def get_health():
    """Health check endpoint reporting device, CUDA availability, and execution mode."""
    return HealthResponse(
        status="operational",
        service="ARHDN YOLOv12 Edge Inference",
        modelVersion=settings.model_version,
        device=settings.resolved_device,
        cudaAvailable=torch.cuda.is_available(),
        isMockMode=not pipeline.detector.is_loaded
    )

@app.get("/model-info", response_model=ModelInfoResponse)
def get_model_info():
    """Returns technical metadata about the YOLOv12 model configuration and classes."""
    return ModelInfoResponse(
        modelName="YOLOv12-Road-Hazard",
        modelVersion=settings.model_version,
        supportedClasses=SUPPORTED_CLASSES,
        device=settings.resolved_device,
        confidenceThreshold=settings.confidence_threshold,
        iouThreshold=settings.iou_threshold,
        modelLoaded=pipeline.detector.is_loaded,
        isMockMode=not pipeline.detector.is_loaded,
        weightsPath=settings.model_path
    )

@app.post("/predict", response_model=PredictResponse)
async def predict_hazard(
    file: UploadFile = File(..., description="Camera frame image (JPEG/PNG)"),
    speed_kmh: Optional[float] = Query(None, description="Current vehicle speed in km/h for motion-aware severity")
):
    """
    Primary endpoint for single-hazard edge prediction.
    Takes a camera frame and returns structured hazard event detection.
    """
    try:
        image_bytes = await file.read()
        if not image_bytes:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty image payload received.")

        result = pipeline.process_raw_bytes(image_bytes, speed_kmh=speed_kmh)
        detections = result.get("detections", [])

        if not detections:
            # When no hazard is present above threshold
            return PredictResponse(
                hazardType="none",
                confidence=0.0,
                boundingBox=[0, 0, 0, 0],
                severity="low",
                processingTimeMs=result["totalProcessingTimeMs"],
                modelVersion=settings.model_version,
                isMock=result["isMock"]
            )

        # Return primary highest-confidence detection
        primary = max(detections, key=lambda d: d["confidence"])
        return PredictResponse(**primary)

    except ValueError as val_err:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(val_err))
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Inference failure: {str(exc)}")

@app.post("/predict/multi", response_model=MultiPredictResponse)
async def predict_multi_hazards(
    file: UploadFile = File(...),
    speed_kmh: Optional[float] = Query(None)
):
    """
    Returns all bounding boxes and hazard classifications identified within the frame.
    """
    try:
        image_bytes = await file.read()
        result = pipeline.process_raw_bytes(image_bytes, speed_kmh=speed_kmh)
        return MultiPredictResponse(
            detections=[PredictResponse(**d) for d in result["detections"]],
            processingTimeMs=result["totalProcessingTimeMs"],
            imageWidth=result["imageWidth"],
            imageHeight=result["imageHeight"],
            isMock=result["isMock"],
            modelVersion=settings.model_version
        )
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))
