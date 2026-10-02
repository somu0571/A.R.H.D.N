import cv2
import numpy as np
from typing import Tuple, Optional

class ImagePreprocessor:
    """
    Modular OpenCV preprocessing pipeline for road hazard camera frames.
    Handles resizing, noise filtering, illumination normalization, and CLAHE enhancement.
    """

    def __init__(
        self,
        target_size: Tuple[int, int] = (640, 640),
        denoise: bool = True,
        clahe_enabled: bool = True,
        normalize: bool = True
    ):
        self.target_size = target_size
        self.denoise = denoise
        self.clahe_enabled = clahe_enabled
        self.normalize = normalize
        self.clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8)) if clahe_enabled else None

    def decode_image_bytes(self, image_bytes: bytes) -> Optional[np.ndarray]:
        """Decode raw image bytes into OpenCV BGR numpy array."""
        np_arr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        return img

    def resize_frame(self, frame: np.ndarray) -> np.ndarray:
        """Resize to target dimensions while maintaining aspect ratio with letterboxing."""
        h, w = frame.shape[:2]
        target_w, target_h = self.target_size

        scale = min(target_w / w, target_h / h)
        nw, nh = int(w * scale), int(h * scale)

        resized = cv2.resize(frame, (nw, nh), interpolation=cv2.INTER_LINEAR)
        canvas = np.full((target_h, target_w, 3), 114, dtype=np.uint8)

        dx = (target_w - nw) // 2
        dy = (target_h - nh) // 2
        canvas[dy:dy+nh, dx:dx+nw] = resized
        return canvas

    def reduce_noise(self, frame: np.ndarray) -> np.ndarray:
        """Bilateral filter to smooth road textures while preserving crack and pothole edges."""
        if not self.denoise:
            return frame
        return cv2.bilateralFilter(frame, d=5, sigmaColor=50, sigmaSpace=50)

    def enhance_contrast(self, frame: np.ndarray) -> np.ndarray:
        """Apply CLAHE in LAB color space to handle adverse shadows, bright sun, or overcast lighting."""
        if not self.clahe_enabled or self.clahe is None:
            return frame
        lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        cl = self.clahe.apply(l)
        enhanced_lab = cv2.merge((cl, a, b))
        return cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)

    def normalize_lighting(self, frame: np.ndarray) -> np.ndarray:
        """Brightness adjustment based on mean pixel luminance."""
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        brightness = np.mean(gray)
        # If under-exposed (e.g., shaded road or twilight)
        if brightness < 70:
            gamma = 1.4
            inv_gamma = 1.0 / gamma
            table = np.array([((i / 255.0) ** inv_gamma) * 255 for i in np.arange(0, 256)]).astype("uint8")
            return cv2.LUT(frame, table)
        return frame

    def preprocess_pipeline(self, frame: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """
        Executes full preprocessing pipeline.
        Returns:
            (preprocessed_bgr, tensor_ready_normalized)
        """
        balanced = self.normalize_lighting(frame)
        denoised = self.reduce_noise(balanced)
        enhanced = self.enhance_contrast(denoised)
        resized = self.resize_frame(enhanced)

        tensor_ready = resized.astype(np.float32)
        if self.normalize:
            tensor_ready /= 255.0

        return resized, tensor_ready
