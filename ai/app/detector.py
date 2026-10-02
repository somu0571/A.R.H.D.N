import os
import time
import random
from typing import List, Dict, Any, Optional
import numpy as np

from .config import settings
from .severity import compute_severity_score

# Supported classes aligned with RDD2022 dataset mapping
SUPPORTED_CLASSES = [
    "pothole",
    "crack",
    "waterlogging",
    "damaged_surface"
]

class YOLOv12Detector:
    """
    YOLOv12 Object Detection Wrapper for ARHDN Road Hazard Detection.
    Loads trained YOLOv12 weights from best.pt if present.
    If weights are absent, enters clearly separated DEMO / MOCK mode with isMock=True flag.
    """

    def __init__(self):
        self.model = None
        self.is_loaded = False
        self.device = settings.resolved_device
        self.classes = SUPPORTED_CLASSES
        self._initialize_model()

    def _initialize_model(self):
        model_path = settings.model_path
        if os.path.exists(model_path) and os.path.getsize(model_path) > 1024:
            try:
                # Attempt loading with ultralytics YOLO or torch hub for YOLOv12
                from ultralytics import YOLO
                print(f"[ARHDN AI] Loading YOLOv12 weights from: {model_path} onto {self.device}")
                self.model = YOLO(model_path)
                self.is_loaded = True
                print("[ARHDN AI] YOLOv12 Model loaded successfully.")
            except Exception as e:
                print(f"[ARHDN AI WARNING] Failed to initialize model from {model_path}: {e}")
                print("[ARHDN AI] Switching to explicit DEMO / MOCK MODE.")
                self.is_loaded = False
        else:
            print(f"[ARHDN AI INFO] Model weights file not found at '{model_path}'.")
            print("[ARHDN AI] Running in separated DEMO / MOCK MODE for developer and simulation testing.")
            self.is_loaded = False

    def detect(
        self,
        image_np: np.ndarray,
        speed_kmh: Optional[float] = None
    ) -> List[Dict[str, Any]]:
        """
        Executes inference on preprocessed image frame.
        Returns a list of structured hazard detections.
        """
        start_time = time.perf_counter()
        h, w = image_np.shape[:2]

        # REAL MODEL INFERENCE PATH
        if self.is_loaded and self.model is not None:
            results = self.model.predict(
                source=image_np,
                conf=settings.confidence_threshold,
                iou=settings.iou_threshold,
                device=self.device,
                verbose=False
            )
            elapsed_ms = int((time.perf_counter() - start_time) * 1000)

            detections = []
            for r in results:
                boxes = r.boxes
                for box in boxes:
                    cls_id = int(box.cls[0].item())
                    conf = float(box.conf[0].item())
                    xyxy = box.xyxy[0].tolist()
                    box_coords = [int(v) for v in xyxy]

                    cls_name = self.classes[cls_id] if cls_id < len(self.classes) else "damaged_surface"
                    sev = compute_severity_score(
                        cls_name,
                        conf,
                        box_coords,
                        frame_width=w,
                        frame_height=h,
                        speed_kmh=speed_kmh
                    )

                    detections.append({
                        "hazardType": cls_name,
                        "confidence": round(conf, 4),
                        "boundingBox": box_coords,
                        "severity": sev,
                        "processingTimeMs": elapsed_ms,
                        "modelVersion": "YOLOv12",
                        "isMock": False
                    })
            return detections

        # SEPARATED DEMO / MOCK MODE PATH
        else:
            elapsed_ms = int((time.perf_counter() - start_time) * 1000) + random.randint(35, 75)
            # Generate deterministic/contextual hazard box simulation for demo frame
            simulated_hazard = random.choice(SUPPORTED_CLASSES)
            sim_conf = round(random.uniform(0.68, 0.96), 4)

            # Realistic bounding box on road region (lower 60% of frame)
            bx1 = random.randint(int(w * 0.15), int(w * 0.55))
            by1 = random.randint(int(h * 0.45), int(h * 0.75))
            bw = random.randint(int(w * 0.15), int(w * 0.35))
            bh = random.randint(int(h * 0.10), int(h * 0.20))
            box_coords = [bx1, by1, min(w, bx1 + bw), min(h, by1 + bh)]

            sev = compute_severity_score(
                simulated_hazard,
                sim_conf,
                box_coords,
                frame_width=w,
                frame_height=h,
                speed_kmh=speed_kmh or 35.0
            )

            return [{
                "hazardType": simulated_hazard,
                "confidence": sim_conf,
                "boundingBox": box_coords,
                "severity": sev,
                "processingTimeMs": elapsed_ms,
                "modelVersion": "YOLOv12",
                "isMock": True
            }]
