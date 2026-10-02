# ARHDN End-to-End Data Flow

The ARHDN data processing pipeline follows a ten-stage lifecycle from initial physical sensing to municipal remediation:

```
[1. CAPTURE] ──► [2. PREPROCESS] ──► [3. DETECT] ──► [4. ENRICH] ──► [5. TRANSMIT]
                                                                            │
                                                                            ▼
  [10. ACT]   ◄── [9. ANALYZE]    ◄── [8. VISUALIZE] ◄── [7. STORE]  ◄── [6. VERIFY]
```

---

## 1. Capture
- **Hardware**: Compact mobile sensing unit mounted on a vehicle/rover (e.g., Raspberry Pi Camera v2/v3, USB industrial camera) or existing RTSP roadside CCTV streams.
- **Acquisition**: Frames are sampled at configurable rates (8–15 FPS for mobile units depending on vehicle velocity; 1–5 FPS for stationary CCTV surveillance).

## 2. Preprocess (OpenCV Modular Pipeline)
- **Decoding**: Frame buffers are ingested as uncompressed numpy arrays in BGR color space.
- **Lighting Equalization**: Gamma curve adjustment triggers automatically if mean image luminance falls below threshold ($\mu < 70$).
- **Noise Filtering**: Bilateral filtering attenuates high-frequency camera noise while preserving high-contrast edge gradients required for crack detection.
- **Local Contrast Enhancement**: Contrast Limited Adaptive Histogram Equalization (CLAHE) balances extreme shadows and intense direct sunlight.
- **Letterbox Resizing**: Frames are scaled to $640 \times 640$ pixels preserving aspect ratio with zero-distortion padding.

## 3. Detect (YOLOv12 Edge Inference)
- **Model**: YOLOv12 neural architecture fine-tuned on the RDD2022 road damage dataset.
- **Output**: Bounding box coordinates $[x_1, y_1, x_2, y_2]$, class prediction (`pothole`, `crack`, `waterlogging`, `damaged_surface`), and prediction confidence score $\in [0.0, 1.0]$.
- **Hardware Acceleration**: Automatically selects CUDA GPU acceleration if available, falling back gracefully to optimized CPU vector instructions.

## 4. Enrich
- **Sensor Fusion**: Correlates the visual detection with hardware telemetry recorded at the identical timestamp:
  - **GPS**: Latitude, longitude, altitude, velocity (km/h), and heading bearing.
  - **IMU (6-DOF)**: Accelerometer $[a_x, a_y, a_z]$ and gyroscope $[\omega_x, \omega_y, \omega_z]$ detecting physical bump impacts.
- **Severity Heuristic**: Synthesizes hazard class weight, detection confidence, pixel footprint, and vehicle speed into a severity rating (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).

## 5. Transmit
- **Payload**: Edge device packages a lightweight structured JSON event payload (preventing costly edge-to-cloud raw video uploading).
- **Transport**: Transmitted over HTTPS REST API (`POST /api/detections`) or WebSockets via 4G/LTE or Wi-Fi uplink.
- **Offline Resiliency**: Unsent events are buffered in local SQLite/JSON storage on the edge unit if network connectivity drops.

## 6. Verify (Common Intelligence Layer)
- **Ingestion**: Central backend receives normalized events from both mobile rovers and fixed CCTVs.
- **Spatial Clustering**: Compares detection coordinates against active hazard events using Haversine spherical distance ($r \le 50\text{ m}$).
- **Temporal Grouping**: Associates repeat detections within a rolling 24-hour observation window.
- **Verification Trigger**: Once $\ge 2$ distinct observations confirm a hazard, its status transitions from `UNVERIFIED` to `VERIFIED`.

## 7. Store (MongoDB Road Condition Database)
- **Persistence**: Individual raw observations are written to the `detections` collection (preserving raw history).
- **Aggregated Record**: Linked or newly created parent `hazardevents` records maintain state, verification counts, and first/last observed timestamps.
- **Geospatial Indexing**: 2D sphere indexes allow rapid spatial queries for map rendering and proximity queries.

## 8. Visualize (Real-Time Command Center)
- **WebSocket Broadcast**: Server triggers `detection:new`, `hazard:verified`, and `alert:new` events to all connected operator browser clients.
- **Interactive Map**: Leaflet map displays real-time rover positions, CCTV nodes, verified hazard clusters, and road segment risk overlays.
- **Telemetry Gauge**: Live monitoring route displays live FPS, CPU/RAM usage, temperatures, and vehicle orientation.

## 9. Analyze (Road Health & Analytics)
- **Segment Scoring**: Road segment health scores update dynamically.
- **Trend Aggregation**: Hazard frequency by type, severity distributions, and source breakdowns are aggregated for municipal decision-makers.
- **Report Generation**: Exportable daily, weekly, or incident-based performance digests.

## 10. Act (Repair Priority Queue & Maintenance)
- **Work Order Generation**: Critical and verified hazards automatically spawn maintenance tickets in the Repair Priority Queue.
- **Team Dispatch**: Operations supervisors assign tasks to municipal maintenance squads.
- **Resolution Tracking**: Field crews mark repairs `IN_PROGRESS` and `RESOLVED` once physical asphalt resurfacing or drainage clearance is completed.
