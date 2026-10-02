import os
import torch
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "ARHDN YOLOv12 Inference Service"
    model_version: str = "YOLOv12"
    model_path: str = os.getenv("YOLO_MODEL_PATH", "./models/best.pt")
    confidence_threshold: float = float(os.getenv("YOLO_CONFIDENCE_THRESHOLD", "0.40"))
    iou_threshold: float = float(os.getenv("YOLO_IOU_THRESHOLD", "0.45"))
    requested_device: str = os.getenv("YOLO_DEVICE", "auto")
    demo_mode: bool = os.getenv("DEMO_MODE", "true").lower() in ("true", "1", "yes")

    @property
    def resolved_device(self) -> str:
        if self.requested_device == "auto":
            return "cuda:0" if torch.cuda.is_available() else "cpu"
        elif self.requested_device in ("cuda", "cuda:0", "gpu"):
            return "cuda:0" if torch.cuda.is_available() else "cpu"
        return "cpu"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
