# ARHDN AI/ML Datasets Documentation

The ARHDN software architecture and machine learning pipeline rely on four distinct computer vision datasets, each serving a targeted purpose in the model lifecycle.

## Dataset Classification & Strategy Table

| Dataset | Purpose | ARHDN Role |
|---------|---------|------------|
| RDD2022 | Potholes, cracks, road-surface damage | Primary hazard detection |
| BDD100K | Road scene understanding | Context |
| CULane | Lane detection and road structure | Road structure context |
| ACDC | Rain, fog and night conditions | Robustness evaluation |

---

## Strategic Dataset Separation Principle

> **Important Architectural Rule:**
> ARHDN strictly avoids blindly merging disparate datasets into a single monolithic training corpus. Differences in coordinate systems, camera perspectives, annotation formats (bounding boxes vs. polyline masks vs. semantic segmentation), and labeling taxonomies introduce label noise and negative transfer if combined naively.

Instead, ARHDN adopts a tri-tier partitioned methodology:

1. **Primary Hazard Training Data (`RDD2022`)**: The foundational dataset for training and fine-tuning YOLOv12 object detection heads.
2. **Contextual Auxiliary Data (`BDD100K` & `CULane`)**: Referenced for scene context, drivable area verification, and road geometry analysis.
3. **Robustness Evaluation Data (`ACDC`)**: Reserved strictly for out-of-distribution validation to benchmark model stability under adverse weather.

---

## 1. RDD2022 (Road Damage Dataset 2022)
- **Role in ARHDN**: Primary Training & Fine-Tuning Corpus.
- **Purpose**: Specialized pavement distress identification covering longitudinal cracks, transverse cracks, alligator cracking, potholes, and surface deterioration across multiple geographic regions.
- **ARHDN Class Alignment**:
  - Class D00 (Wheel mark part longitudinal crack) $\rightarrow$ `crack`
  - Class D10 (Equal interval longitudinal crack) $\rightarrow$ `crack`
  - Class D20 (Alligator crack / network crack) $\rightarrow$ `crack` / `damaged_surface`
  - Class D40 (Pothole / rutting / bump) $\rightarrow$ `pothole`
- **Annotation Format**: Pascal VOC XML / YOLO standard format $[class, x_{center}, y_{center}, w, h]$.
- **Performance Benchmark**: *To be verified from the official dataset documentation.*

---

## 2. BDD100K (Berkeley DeepDrive)
- **Role in ARHDN**: Road Scene Understanding & Drivable Context.
- **Purpose**: Diverse driving video dataset capturing vehicles, pedestrians, traffic signs, and drivable area segmentation across varied daylight and geographic conditions.
- **ARHDN Integration**: Provides pre-trained contextual feature representations and assists in false-positive rejection (ensuring detected distress features exist on the roadway rather than off-road terrain or building facades).
- **Performance Benchmark**: *To be verified from the official dataset documentation.*

---

## 3. CULane
- **Role in ARHDN**: Road & Lane Structure Analysis.
- **Purpose**: Large-scale dataset focused on lane boundary detection in metropolitan highway and urban traffic settings.
- **ARHDN Integration**: Serves as auxiliary structural reference to map hazards relative to active travel lanes (e.g., center-lane pothole posing direct vehicular hazard vs. shoulder/curbside defect).
- **Performance Benchmark**: *To be verified from the official dataset documentation.*

---

## 4. ACDC (Adverse Conditions Dataset with Correspondences)
- **Role in ARHDN**: Robustness & Environmental Generalization Evaluation.
- **Purpose**: Curated evaluation benchmark specifically collected in four extreme adverse driving conditions:
  - Fog
  - Night
  - Rain
  - Snow
- **ARHDN Integration**: Used as an independent evaluation suite to test the YOLOv12 model's degradation under low-illumination and wet reflection conditions, guiding the OpenCV modular preprocessing pipeline's contrast enhancement (CLAHE) settings.
- **Performance Benchmark**: *To be verified from the official dataset documentation.*
