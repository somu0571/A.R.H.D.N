# ARHDN AI & Computer Vision Service

## Overview
This service provides edge-ready computer vision and object detection for the **Autonomous Road Hazard Detection Network (ARHDN)**. It uses **YOLOv12** for detecting road hazards and **OpenCV** for modular image enhancement and normalization.

## Architectural Pipeline
```
[Camera / Video Stream]
         │
         ▼
[OpenCV Modular Preprocessing]
  ├── Lighting Normalization
  ├── Bilateral Noise Reduction
  ├── CLAHE Local Contrast Enhancement
  └── Letterbox Resizing (640x640)
         │
         ▼
[YOLOv12 Inference Engine]
  ├── Tensor normalization
  ├── NMS & IOU thresholding
  └── Class confidence filtering
         │
         ▼
[Analytical Severity Engine]
  ├── Area Footprint Calculation
  ├── Motion Velocity Scaling
  └── Hazard Class Weighting
         │
         ▼
[Structured Hazard Event JSON Output]
```

## Supported Hazard Classes
The detection engine is configured for the following classes (mapped from the primary road damage dataset):
- `pothole`
- `crack`
- `waterlogging`
- `damaged_surface`

## Training & Fine-Tuning Strategy
Models are trained offline on workstation/cloud GPUs and deployed as quantized or lightweight checkpoints to edge sensing units. **Do not train models directly on edge devices such as the Raspberry Pi.**

```
Primary Dataset (RDD2022) ──► Annotation Alignment ──► YOLOv12 Fine-Tuning
Auxiliary Datasets         ──► Feature Analysis     ──► Validation & Benchmarking
Adverse Weather (ACDC)     ──► Stress Testing       ──► Model Checkpoint (best.pt)
                                                             │
                                                             ▼
                                                    Edge Deployment (.pt / ONNX)
```

### Dataset Roles
- **RDD2022 (Road Damage Dataset 2022)**: Primary training dataset for pothole, crack, and road-surface damage detection.
- **BDD100K**: Secondary context dataset for driving environment and road scene understanding.
- **CULane**: Auxiliary context dataset for lane boundary and road geometry reference.
- **ACDC (Adverse Conditions Dataset with Correspondences)**: Robustness evaluation dataset for foggy, rainy, nighttime, and adverse lighting conditions.

*Note: Datasets are kept distinct and are not merged arbitrarily due to differences in annotation schema and labeling taxonomy.*

## Hardware Acceleration & Device Selection
The service inspects hardware capability dynamically via PyTorch:
- **CUDA / GPU**: Automatically utilized if an NVIDIA CUDA device is detected (`cuda:0`).
- **CPU**: Gracefully selected if CUDA is unavailable.
- Configurable via `YOLO_DEVICE=auto` (or `cpu`, `cuda`).

## Demo / Mock Mode Separation
To allow full end-to-end integration and simulation testing without requiring multi-gigabyte weights files during initial setup:
- If `./models/best.pt` is absent or unreadable, the service operates in an explicit **DEMO / MOCK MODE**.
- The API response explicitly flags `"isMock": true` and `"isMockMode": true` in health reports.
- When real weights are supplied, `"isMock": false` is returned. Mock and production outputs are never mixed.

## REST API Endpoints

### 1. `GET /health`
Returns service status, device target, CUDA availability, and execution mode.

### 2. `GET /model-info`
Returns model metadata, configured thresholds, supported classes, and weight paths.

### 3. `POST /predict`
Accepts multipart form-data image file (`file`) and optional vehicle velocity (`speed_kmh`).
Returns structured JSON:
```json
{
  "hazardType": "pothole",
  "confidence": 0.94,
  "boundingBox": [120, 80, 420, 310],
  "severity": "high",
  "processingTimeMs": 118,
  "modelVersion": "YOLOv12",
  "isMock": false
}
```

### 4. `POST /predict/multi`
Returns all detected hazards within a single frame along with dimensional metadata.

## Running the Service Locally
```bash
# Navigate to ai directory
cd ai

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run FastAPI server with Uvicorn
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
