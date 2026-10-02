# ARHDN AI & Computer Vision Pipeline

This document describes the computer vision engineering lifecycle, model architecture, training regimen, and edge deployment procedures for ARHDN.

## 1. Pipeline Overview
```
[RDD2022 Dataset]
       │
       ▼
[Data Preparation & Validation]
  ├── Label alignment to 4 target classes
  ├── K-fold train/val/test split
  └── Mosaic, MixUp, & Color Jitter augmentation
       │
       ▼
[YOLOv12 Neural Architecture Training]
  ├── Backbone: Attention-centric feature extraction
  ├── Neck: Path Aggregation Network (PAN)
  └── Head: Anchor-free multi-scale detection heads
       │
       ▼
[Model Validation & Verification]
  ├── Convergence evaluation on RDD2022 Validation Split
  └── Robustness evaluation on ACDC (Fog/Rain/Night)
       │
       ▼
[Export & Quantization]
  ├── Checkpoint selection (best.pt)
  └── Optional TensorRT / ONNX export for edge acceleration
       │
       ▼
[Edge Inference Deployment]
  ├── OpenCV Modular Preprocessing
  └── FastAPI Microservice on Rover / Edge Gateway
```

---

## 2. YOLOv12 Model Architecture
ARHDN specifies **YOLOv12** as its primary object detection backbone. YOLOv12 introduces area-attention mechanisms and optimized latency-accuracy Pareto frontiers tailored for real-time edge embedded vision.

### Target Classes
1. `pothole`: Depressions and structural surface cavities in asphalt or concrete.
2. `crack`: Longitudinal, transverse, and interconnected alligator fractures.
3. `waterlogging`: Standing water pools on pavement obscuring surface integrity.
4. `damaged_surface`: Severe raveling, rutting, spalling, and gravel breakdown.

---

## 3. Training Protocol
> **Hardware Guidance**: Training must be executed on a dedicated GPU workstation or cloud cluster (NVIDIA A100 / RTX 4090). **Never train full models on low-power edge nodes like the Raspberry Pi.**

```bash
# Example Training Command (Run on training workstation)
yolo detect train \
  data=./data/rdd2022_arhdn.yaml \
  model=yolov12n.pt \
  epochs=100 \
  imgsz=640 \
  batch=32 \
  device=0 \
  optimizer=AdamW \
  lr0=0.001 \
  save=True
```

### Hyperparameter Defaults
- **Input Resolution**: $640 \times 640$ pixels
- **Confidence Threshold**: $0.40$
- **IoU NMS Threshold**: $0.45$
- **Inference Precision**: FP16 / INT8 quantized for edge execution

---

## 4. Edge Deployment Architecture
Once training yields `best.pt`:
1. The checkpoint is placed into `ai/models/best.pt`.
2. The FastAPI inference service automatically detects the file upon boot and instantiates the detector with CUDA or CPU execution.
3. If no weights file is mounted, the service activates the isolated **Demo / Mock Mode** (`isMock=True`) to allow full end-to-end integration and frontend dashboard testing without blocking development.

---

## 5. Performance Metrics Policy
> **Ethical ML Reporting Note:**
> In accordance with project standards, ARHDN software strictly prohibits fabricating accuracy, precision, recall, or mAP metrics in code or documentation. Model performance must be cited only when empirically determined via rigorous evaluation on designated test benchmarks. Prior to official benchmark runs, all metrics are designated as `To be verified from empirical testing`.
