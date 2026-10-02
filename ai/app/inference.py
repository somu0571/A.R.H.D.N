from typing import List, Dict, Any, Optional
import time
from .preprocessing import ImagePreprocessor
from .detector import YOLOv12Detector

class InferencePipeline:
    """
    End-to-End inference engine combining OpenCV modular preprocessing
    with the YOLOv12 object detector.
    """

    def __init__(self):
        self.preprocessor = ImagePreprocessor()
        self.detector = YOLOv12Detector()

    def process_raw_bytes(
        self,
        image_bytes: bytes,
        speed_kmh: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Takes raw image bytes, runs OpenCV preprocessing, and performs YOLOv12 detection.
        """
        start = time.perf_counter()

        # Step 1: Decode via OpenCV
        frame = self.preprocessor.decode_image_bytes(image_bytes)
        if frame is None:
            raise ValueError("Unable to decode provided image stream. Format unsupported.")

        orig_h, orig_w = frame.shape[:2]

        # Step 2: Modular Preprocessing (Lighting, bilateral denoise, CLAHE, letterbox resize)
        preprocessed_bgr, _ = self.preprocessor.preprocess_pipeline(frame)

        # Step 3: YOLOv12 Detection
        detections = self.detector.detect(preprocessed_bgr, speed_kmh=speed_kmh)

        total_elapsed_ms = int((time.perf_counter() - start) * 1000)

        # Update elapsed time to reflect full pipeline
        for det in detections:
            det["processingTimeMs"] = max(det["processingTimeMs"], total_elapsed_ms)

        is_mock = detections[0]["isMock"] if detections else (not self.detector.is_loaded)

        return {
            "detections": detections,
            "totalProcessingTimeMs": total_elapsed_ms,
            "imageWidth": orig_w,
            "imageHeight": orig_h,
            "isMock": is_mock,
            "modelVersion": "YOLOv12"
        }
