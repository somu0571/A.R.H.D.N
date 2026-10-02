# ARHDN System Architecture

## 1. Executive Summary
The **Autonomous Road Hazard Detection Network (ARHDN)** is a continuous, intelligent road-hazard detection and municipal road management platform. It transforms moving vehicles (rovers, transit buses, municipal fleets, patrol cars) and static infrastructure (existing roadside CCTV cameras) into a cooperative road-sensing network.

The platform detects road surface hazards—such as **potholes, cracks, waterlogging, and damaged road surfaces**—and enriches every detection with high-resolution geospatial coordinates, timestamps, motion telemetry, and AI confidence metrics before streaming them to a centralized municipal intelligence hub.

```
                      +----------------------------------+
                      |         MOBILE SENSING           |
                      |  Vehicle / Rover Sensing Module  |
                      |   Camera + GPS + 6-DOF IMU       |
                      +-----------------+----------------+
                                        |
                                        ▼
                      +----------------------------------+
                      |          EDGE AI NODE            |
                      |    OpenCV Modular Filtering      |
                      |    YOLOv12 Hazard Inference      |
                      +-----------------+----------------+
                                        |
                                        ▼
                      +----------------------------------+
                      |       EVENT ENRICHMENT           |
                      |   Location + Motion Context      |
                      |   Severity + Confidence Scoring  |
                      +-----------------+----------------+
                                        |
                   +--------------------+--------------------+
                   |                                         |
                   ▼ (Wi-Fi / 4G)                            ▼ (RTSP / HTTPS)
      +-------------------------+               +-------------------------+
      |  Mobile Observation     |               |  Roadside CCTV Ingest   |
      +------------+------------+               +------------+------------+
                   |                                         |
                   +--------------------+--------------------+
                                        |
                                        ▼
                      +----------------------------------+
                      |   COMMON INTELLIGENCE LAYER      |
                      |  - Normalized Event Schema       |
                      |  - Multi-Source Verification     |
                      |  - Spatial/Temporal Deduplication|
                      |  - Cross-Source Association      |
                      |  - Hazard Event Aggregation      |
                      +-----------------+----------------+
                                        |
                                        ▼
                      +----------------------------------+
                      |        MONGODB DATA LAYER        |
                      |   Historical Road Condition DB   |
                      |   Detections & Hazard Events     |
                      +-----------------+----------------+
                                        |
                   +--------------------+--------------------+
                   |                                         |
                   ▼                                         ▼
      +-------------------------+               +-------------------------+
      |    ANALYTICS ENGINE     |               |  REAL-TIME DASHBOARD    |
      |  - Road Health Index    |               |  - Live Hazard Map      |
      |  - Risk Classification  |               |  - Rover Telemetry      |
      |  - Coverage Tracking    |               |  - WebSocket Alerts     |
      +------------+------------+               +------------+------------+
                   |                                         |
                   +--------------------+--------------------+
                                        |
                                        ▼
                      +----------------------------------+
                      |     REPAIR PRIORITY QUEUE        |
                      |  Work Orders & Team Assignment   |
                      |  Escalation & Resolution Flow    |
                      +----------------------------------+
```

---

## 2. Core Architectural Pillars

### 2.1 Hybrid Road Sensing
ARHDN reconciles two heterogeneous data streams into a unified processing fabric:
1. **Mobile Sensing (Rovers / Vehicles)**:
   - High mobility, dynamic viewing angles, close proximity to pavement defects.
   - Continuous 6-DOF IMU telemetry (accelerometer + gyroscope) for bump and motion correlation.
   - Precise GPS coordinates (latitude, longitude, altitude, heading, speed).
2. **Existing Roadside CCTV**:
   - Fixed vantage points overlooking busy intersections and thoroughfares.
   - 24/7 continuous surveillance of static road segments.
   - Known fixed geospatial coordinates mapped in the municipal registry.

### 2.2 Common Intelligence Layer (Backend Engine)
The Common Intelligence Layer avoids treating mobile platforms and CCTV as siloed systems. Both feed raw detections into a normalized ingest gateway:
- **Spatial Deduplication**: Uses Haversine spherical geodesic calculation with a 50-meter proximity threshold to group repeated observations.
- **Temporal Association**: Correlates recurring detections over sliding 24-hour windows.
- **Multi-Source Verification**: Upgrades an isolated `Detection` into a verified `HazardEvent` once confirmed by multiple distinct sources (e.g., Rover A + Rover B or Rover + CCTV).
- **Severity Escalation**: Dynamically adjusts severity from `LOW` to `CRITICAL` based on bounding box size, recurring observation frequency, vehicle speed, and hazard category.

### 2.3 Road Health Index (Analytical Indicator)
*Disclaimer: The Road Health Index is an internal ARHDN analytical score designed for municipal prioritization and is not an officially promulgated government standard.*
- Calculated continuously for defined road segments on a 0–100 scale:
  $$\text{HealthScore} = \max(0, 100 - (\text{CriticalHazards} \times 15) - (\text{TotalHazards} \times 3))$$
- Categorizes segments into four risk tiers: `LOW` (>75), `MEDIUM` (51–75), `HIGH` (26–50), and `CRITICAL` (0–25).

### 2.4 Repair Priority Queue
Converts raw hazard events into actionable maintenance tickets for municipal public works crews:
- Prioritizes work orders using a composite metric:
  $$\text{Priority} = \text{SeverityWeight} + (\text{VerificationCount} \times 5) + \text{RoadImportancePenalty}$$
- Tracks life cycle through stages: `PENDING` $\rightarrow$ `ASSIGNED` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `RESOLVED`.
