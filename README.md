# ARHDN

Autonomous Road Hazard Detection Network

---

## 1. Overview
The **Autonomous Road Hazard Detection Network (ARHDN)** is an end-to-end, edge-to-cloud cyber-physical platform designed to turn ordinary moving vehicles into continuous road-sensing platforms. Supported by existing roadside CCTV infrastructure, ARHDN continuously detects, verifies, and analyzes road surface defects—including potholes, cracks, waterlogging, and structural deterioration—delivering automated intelligence, dynamic Road Health Index analytics, and actionable repair priorities to municipal transportation authorities.

---

## 2. Problem
Traditional municipal road condition surveys are manual, sporadic, costly, and hazardous to inspect. Pavements suffer from severe degradation caused by heavy traffic, monsoon inundation, and thermal cycling. Defects such as potholes and surface cracks often remain unaddressed for months until citizen complaints or accidents occur. Moreover, local authorities lack real-time visibility into spatial road health and automated prioritization tools to direct limited maintenance resources efficiently.

---

## 3. Solution
ARHDN solves this by deploying a distributed mobile sensing network. Compact sensing units—consisting of a road-facing camera, GPS receiver, and 6-DOF IMU—are mounted onto public transit buses, municipal utility vehicles, and inspection rovers. Operating in concert with stationary roadside CCTV cameras, edge-deployed YOLOv12 models detect pavement hazards in real time. Detections are enriched with high-precision coordinates, velocity, and bump context before being securely transmitted to a centralized intelligence hub for multi-source verification and work order generation.

---

## 4. Key Features
- **Continuous Mobile Sensing**: Transforms public transit, service fleets, and rovers into automated roadway surveying assets.
- **Hybrid Source Ingestion**: Unifies mobile vehicle feeds and stationary roadside CCTV infrastructure into a common data stream.
- **Edge AI Hazard Detection**: YOLOv12 neural detection specifically fine-tuned for potholes, cracks, waterlogging, and surface damage.
- **OpenCV Modular Preprocessing**: Real-time lighting normalization, bilateral noise suppression, and CLAHE contrast enhancement for adverse conditions.
- **GPS & IMU Sensor Fusion**: Enriches detections with latitude, longitude, speed, heading, and 3-axis accelerometer/gyroscope physical shock context.
- **Common Intelligence Layer**: Real-time spatial/temporal deduplication and multi-source verification engine.
- **Road Health Index**: Segment-by-segment analytical score evaluating municipal pavement condition and risk tiers.
- **Repair Priority Queue**: Automated maintenance ticket generation, team assignment, and resolution tracking.
- **Municipal Command Center UI**: Modern, responsive dark-themed dashboard with Leaflet GIS mapping, live video overlays, and real-time WebSocket updates.
- **Comprehensive Simulation Engine**: Built-in simulator for vehicle paths, telemetry streams, and hazard occurrences for demonstrations without hardware dependencies.

---

## 5. System Architecture
```
                ARHDN SYSTEM ARCHITECTURE

       +------------------------------------+
       |          MOBILE SENSING            |
       |  Camera + GPS + 6-DOF IMU Sensor   |
       +-----------------+------------------+
                         |
                         ▼
       +------------------------------------+
       |             EDGE AI                |
       |  OpenCV Modular + YOLOv12 Engine   |
       +-----------------+------------------+
                         |
                         ▼
       +------------------------------------+
       |         EVENT ENRICHMENT           |
       | Location + Severity + Motion Context|
       +-----------------+------------------+
                         |
         +---------------+---------------+
         |                               |
         ▼ (Wi-Fi / 4G)                  ▼ (RTSP / Stream)
+------------------+           +-------------------+
| Mobile Detection |           | Existing Roadside |
|   Observation    |           |    CCTV Node      |
+--------+---------+           +---------+---------+
         |                               |
         +---------------+---------------+
                         |
                         ▼
       +------------------------------------+
       |     COMMON INTELLIGENCE LAYER      |
       | Multi-Source Verification Engine   |
       | Spatial Clustering & Deduplication |
       | Hazard Event Aggregation           |
       +-----------------+------------------+
                         |
                         ▼
       +------------------------------------+
       |           MONGODB LAYER            |
       | Detections, Hazard Events, History |
       +-----------------+------------------+
                         |
         +---------------+---------------+
         |                               |
         ▼                               ▼
+------------------+           +-------------------+
| Analytics Engine |           | Real-Time Console |
| Road Health Index|           | Live GIS Map      |
| Risk Scoring     |           | Telemetry Stream  |
+--------+---------+           +---------+---------+
         |                               |
         +---------------+---------------+
                         |
                         ▼
       +------------------------------------+
       |       REPAIR PRIORITY QUEUE        |
       | Municipal Work Orders & Resolution |
       +------------------------------------+
```

---

## 6. Mobile Sensing
Mobile sensing leverages compact vehicle modules:
- **Optical Sensors**: Road-facing cameras capturing asphalt at glancing down angles.
- **Geospatial Tracking**: GPS receivers reporting WGS84 coordinates, speed, heading, and altitude.
- **Inertial Measurement Units (IMU)**: 6-DOF sensors detecting physical vehicle vibrations and vertical shock impacts ($a_z$) correlating directly with pothole traversal.
- **Edge Microcontroller / SBC**: Raspberry Pi 4B/5 or equivalent onboard computer orchestrating local acquisition and inference.

---

## 7. CCTV Integration
ARHDN treats fixed roadside CCTV infrastructure as an integrated sensor stream:
- Connects to existing RTSP/HTTP municipal traffic video streams.
- Analyzes fixed road scenes for accumulating waterlogging, pavement ravelling, and defect formation.
- Maps camera coordinates to registered municipal intersection locations.
- Feeds observations into the Common Intelligence Layer using the identical normalized schema as mobile rovers.

---

## 8. AI/ML Pipeline
```
[Primary Dataset: RDD2022] ──► Preprocessing & Augmentation ──► YOLOv12 Training
[Context Datasets: BDD100K/CULane] ──► Validation & Benchmarking
[Adverse Conditions: ACDC] ──► Robustness Stress Testing
                                            │
                                            ▼
                               [Model Checkpoint: best.pt]
                                            │
                                            ▼
                                [Edge Inference Runtime]
                                 ├── OpenCV Enhancement
                                 └── FastAPI Prediction
```

---

## 9. YOLOv12
YOLOv12 is the primary object detection architecture used in ARHDN. It delivers state-of-the-art accuracy-latency trade-offs for real-time edge embedded vision.
- **Supported Classes**:
  - `pothole`
  - `crack`
  - `waterlogging`
  - `damaged_surface`
- **Configurable Thresholds**:
  - Confidence Threshold: $0.40$
  - IoU NMS Threshold: $0.45$
- **Device Support**: Automatic hardware detection utilizing CUDA GPU acceleration when present, with graceful fallback to CPU.
- **Separated Mock Mode**: Operates in an explicit, clearly labeled Demo/Mock mode when model weights are not loaded.

---

## 10. Datasets
The ARHDN software architecture and machine learning pipeline rely on four distinct computer vision datasets:

| Dataset | Purpose | ARHDN Role |
|---------|---------|------------|
| RDD2022 | Potholes, cracks, road-surface damage | Primary hazard detection |
| BDD100K | Road scene understanding | Context |
| CULane | Lane detection and road structure | Road structure context |
| ACDC | Rain, fog and night conditions | Robustness evaluation |

*Note: In accordance with project standards, dataset sizes, mAP, precision, and recall are designated as: To be verified from the official dataset documentation.*

---

## 11. MERN Architecture
The core web application is built on the enterprise MERN stack:
- **MongoDB**: Schema-flexible, geo-indexed document persistence for detections, hazard events, road segments, and telemetry.
- **Express.js**: REST API server providing role-based security, validation, and analytics endpoints.
- **React 18 + TypeScript + Vite**: Responsive, type-safe municipal command center dashboard.
- **Node.js**: Asynchronous event-driven runtime hosting the backend services and WebSocket gateway.

*Python and FastAPI are strictly restricted to the AI and computer vision microservice.*

---

## 12. Common Intelligence Layer
The Common Intelligence Layer is the backend processing engine that aggregates disparate observations:
- **Normalization**: Translates rover, vehicle, and CCTV feeds into uniform detection objects.
- **Spatial Clustering**: Groups nearby detections within a configurable 50-meter Haversine radius.
- **Temporal Grouping**: Associates observations occurring within 24-hour windows.
- **Road Segment Correlation**: Maps observations to municipal road segment registries.
- **Hazard Event Creation**: Automatically creates or updates shared `HazardEvent` entities while preserving raw detection histories.

---

## 13. Multi-source Verification
When a road hazard is independently captured by multiple distinct sources (e.g., Rover Alpha, Rover Beta, and Roadside CCTV-02):
1. The Common Intelligence Layer correlates the events using spatial-temporal proximity.
2. The `verificationCount` counter increments.
3. Upon reaching the threshold ($\ge 2$), the hazard status transitions to `VERIFIED`.
4. High-priority verification alerts are emitted via WebSockets.
5. Work tickets are queued in the Repair Priority Queue.

---

## 14. Road Health Index
The **Road Health Index** is an internal ARHDN analytical score designed for municipal planning.
*(Important: The Road Health Index is an ARHDN analytical indicator and is not an official government standard.)*

- **Scale**: 0 to 100
- **Formula**:
  $$\text{HealthScore} = \max(0, 100 - (\text{CriticalHazards} \times 15) - (\text{TotalHazards} \times 3))$$
- **Risk Classifications**:
  - `LOW`: Health Score > 75
  - `MEDIUM`: Health Score 51–75
  - `HIGH`: Health Score 26–50
  - `CRITICAL`: Health Score $\le 25$

---

## 15. Repair Priority Queue
Converts verified road hazards into actionable municipal work orders:
- **Priority Calculation**: Incorporates severity, verification count, hazard frequency, and road importance.
- **Workflow Stages**: `PENDING` $\rightarrow$ `ASSIGNED` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `RESOLVED`.
- **Assignment**: Enables dispatchers to assign field maintenance teams with dedicated notes and track resolution progress.

---

## 16. Raspberry Pi Integration
The physical sensing module runs on Raspberry Pi 4B/5 hardware:
- Interfaces with CSI/USB cameras via OpenCV.
- Reads GPS serial coordinates via UART NMEA parsing.
- Collects 6-axis motion acceleration from I2C IMUs.
- Transmits structured hazard payloads over 4G/Wi-Fi to the Express backend.
- Provides fallback handling for missing sensors during simulation and bench testing.

---

## 17. Real-time Communication
Powered by **Socket.IO**:
- `detection:new`: Immediate notification of incoming hazard detections.
- `hazard:verified`: Broadcast when multiple sources confirm a hazard.
- `alert:new`: Emergency alerts for critical road failures and hardware offline states.
- `rover:location` & `rover:telemetry`: Continuous GPS path tracking and hardware telemetry.
- `road-health:update`: Live adjustment of road segment risk indicators.
- `repair:update`: Status synchronization across municipal maintenance dispatchers.

---

## 18. Repository Structure
```
ARHDN/
├── ai/                      # Python AI & Computer Vision Service
│   ├── app/
│   │   ├── main.py          # FastAPI application & endpoints
│   │   ├── detector.py      # YOLOv12 model wrapper
│   │   ├── inference.py     # End-to-end inference engine
│   │   ├── preprocessing.py # Modular OpenCV processing
│   │   ├── severity.py      # Analytical severity engine
│   │   ├── schemas.py       # Pydantic request/response schemas
│   │   └── config.py        # Environment & device settings
│   ├── models/              # Checkpoint directory (best.pt)
│   ├── requirements.txt     # Python dependencies
│   └── README.md
│
├── backend/                 # Node.js / Express MERN Backend
│   ├── src/
│   │   ├── config/          # Database & environment config
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # JWT auth, RBAC, error handling
│   │   ├── models/          # Mongoose database models
│   │   ├── routes/          # Express API route declarations
│   │   ├── services/        # Common Intelligence Layer & Simulator
│   │   ├── sockets/         # Socket.IO event handlers
│   │   ├── utils/           # Database seed scripts
│   │   └── server.js        # Main server entrypoint
│   ├── package.json
│   └── Dockerfile
│
├── frontend/                # React / TypeScript / Vite Dashboard
│   ├── src/
│   │   ├── assets/          # SVG logos and styling assets
│   │   ├── components/      # Modular UI components
│   │   ├── context/         # Auth and state providers
│   │   ├── pages/           # Command center views
│   │   ├── services/        # Axios API & Socket.IO clients
│   │   ├── types/           # TypeScript interfaces
│   │   ├── App.tsx          # Router and shell
│   │   └── main.tsx
│   ├── public/
│   │   └── favicon.svg      # Custom SVG favicon
│   ├── package.json
│   └── Dockerfile
│
├── docs/                    # Architectural & Technical Documentation
│   ├── architecture.md      # Detailed system architecture
│   ├── data-flow.md         # 10-stage end-to-end data lifecycle
│   ├── datasets.md          # RDD2022, BDD100K, CULane, ACDC specs
│   ├── ai-pipeline.md       # YOLOv12 training & deployment
│   ├── raspberry-pi.md      # Hardware and sensor integration
│   ├── api.md               # REST & WebSocket documentation
│   └── deployment.md        # Docker and bare-metal deployment
│
├── docker-compose.yml       # Multi-container orchestration
├── .env.example             # Configuration environment template
├── .gitignore
├── LICENSE                  # MIT License
└── README.md                # Project documentation
```

---

## 19. Installation

### Prerequisites
- Node.js $\ge 18$
- Python $\ge 3.10$
- MongoDB $\ge 6.0$
- Git

### Step-by-Step Setup
```bash
# 1. Clone repository
git clone <repo-url> arhdn
cd arhdn

# 2. Configure Environment
cp .env.example .env
```

---

## 20. Environment Variables
Reference configuration in `.env.example`:
```env
# MongoDB Database
MONGO_URI=mongodb://localhost:27017/arhdn

# JWT Security
JWT_SECRET=arhdn_production_secure_secret_key
JWT_EXPIRES_IN=7d

# Server & Network Ports
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
AI_SERVICE_URL=http://localhost:8000

# YOLOv12 Model Settings
YOLO_MODEL_PATH=./models/best.pt
YOLO_CONFIDENCE_THRESHOLD=0.40
YOLO_IOU_THRESHOLD=0.45
YOLO_DEVICE=auto

# Simulation & Demo
DEMO_MODE=true
```

---

## 21. Running Frontend
```bash
cd frontend
npm install
npm run dev
```
Accessible at: `http://localhost:5173`

---

## 22. Running Backend
```bash
cd backend
npm install
npm run seed     # Seeds default admin and operator credentials
npm run dev      # Runs Express server on port 5000
```
API Root: `http://localhost:5000/api`

---

## 23. Running AI Service
```bash
cd ai
python -m venv venv
# Windows:
.\venv\Scripts\Activate.ps1
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation: `http://localhost:8000/docs`

---

## 24. Running Demo Mode
When `DEMO_MODE=true` is enabled in `.env`:
1. The backend automatically boots the simulation service upon startup.
2. Simulated rovers (`ARHDN-01`, `ARHDN-02`, `ARHDN-03`) move dynamically across Delhi NCR road segments.
3. GPS coordinates, motion telemetry, and hazard detections stream automatically via Socket.IO.
4. Roadside CCTVs generate periodic observations.
5. The frontend displays an unambiguous **SIMULATION MODE** indicator.

---

## 25. Deployment
Deploy all microservices with one command via Docker Compose:
```bash
docker compose up --build -d
```
See [Deployment Guide](docs/deployment.md) for full instructions.

---

## 26. Limitations
- Edge inferencing latency varies based on host hardware; low-cost SBCs require quantization (INT8) or TensorRT acceleration for high-speed vehicular capture.
- Severe weather (extreme fog or total lack of illumination) reduces camera detection confidence.
- GPS precision in urban canyons may require RTK correction or visual SLAM augmentation.
- The Road Health Index represents an analytical heuristic and does not supersede local structural engineering standards.

---

## 27. Future Scope
- **Multi-Camera 3D Stereo Reconstruction**: Volumetric pothole depth calculation via calibrated dual lenses.
- **Predictive Road Deterioration Models**: Long-term pavement degradation forecasting using recurrent spatial-temporal neural networks.
- **Fleet Crowdsourcing Protocol**: Lightweight smartphone SDK for municipal bus transit fleets.
- **MQTT Edge Message Broker**: Scalable edge-to-cloud messaging for large-scale municipal vehicle deployments.

---

## 28. License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2026 Team Technova.
