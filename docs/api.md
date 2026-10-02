# ARHDN REST & WebSocket API Specification

## Base URLs
- **Backend HTTP API**: `http://localhost:5000/api`
- **Backend WebSocket Gateway**: `ws://localhost:5000`
- **AI Inference Microservice**: `http://localhost:8000`

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Creates a new municipal user account.
- **Request Body**:
  ```json
  { "name": "Jane Doe", "email": "jane@arhdn.gov", "password": "SecurePassword123!", "role": "OPERATOR" }
  ```
- **Response `201`**: `{ "user": { "id": "...", "name": "...", "email": "...", "role": "..." }, "token": "..." }`

### `POST /api/auth/login`
Authenticates user credentials and returns a signed JWT.
- **Request Body**: `{ "email": "admin@arhdn.gov", "password": "adminPassword123!" }`
- **Response `200`**: `{ "user": { ... }, "token": "..." }`

### `GET /api/auth/me`
Retrieves current authenticated profile from `Authorization: Bearer <token>` header.

---

## 2. Detection Ingestion & Query

### `GET /api/detections`
Lists detections with optional filtering and pagination.
- **Query Parameters**:
  - `hazardType`: `pothole` | `crack` | `waterlogging` | `damaged_surface`
  - `severity`: `LOW` | `MEDIUM` | `HIGH` | `CRITICAL`
  - `sourceType`: `MOBILE_ROVER` | `VEHICLE` | `CCTV`
  - `roverId`, `cameraId`: Filter by identifier
  - `verificationStatus`: `UNVERIFIED` | `VERIFIED` | `REJECTED`
  - `page`, `limit`, `search`: Pagination and text search

### `POST /api/detections`
Ingests a single raw hazard detection from mobile edge units or CCTV cameras. Triggers the Common Intelligence Layer for deduplication, multi-source verification, and alert generation.
- **Request Body**:
  ```json
  {
    "sourceType": "MOBILE_ROVER",
    "sourceId": "ARHDN-01",
    "roverId": "ARHDN-01",
    "hazardType": "pothole",
    "confidence": 0.94,
    "severity": "HIGH",
    "boundingBox": [120, 80, 420, 310],
    "latitude": 28.6139,
    "longitude": 77.2090,
    "speed": 34.5,
    "heading": 88.0,
    "timestamp": "2026-10-02T10:00:00Z"
  }
  ```

---

## 3. Hazard Events (Aggregated Road Hazards)

### `GET /api/hazard-events`
Lists aggregated real-world hazard events formed by multi-source clustering.
- **Response**: Array of `HazardEvent` items with `verificationStatus`, `sourceCount`, `verificationCount`, and linked `detectionIds`.

### `GET /api/hazard-events/:id`
Retrieves single hazard event by `hazardEventId`.

---

## 4. Rover & Mobile Sensing Platforms

### `GET /api/rovers`
Retrieves real-time status, health, and battery of all registered sensing units.

### `GET /api/rovers/:id`
Returns rover details and recent telemetry time-series (CPU, RAM, temperature, IMU).

### `POST /api/rovers`
Registers a new vehicle or rover in the fleet registry.

### `PUT /api/rovers/:id`
Updates telemetry, operational status, or heartbeat timestamp.

---

## 5. Roadside CCTV Cameras

### `GET /api/cctv`
Lists static roadside cameras with active online status, geolocation, and cumulative hazard counts.

### `POST /api/cctv`
Registers a new roadside CCTV node.

---

## 6. Road Health Index

### `GET /api/road-health`
Returns survey data and computed Health Index scores for road segments.
- **Response Properties**:
  - `roadSegmentId`, `name`, `healthScore`, `hazardCount`, `criticalHazards`, `verifiedHazards`, `riskLevel`, `maintenancePriority`.

### `GET /api/road-health/:id`
Returns detail for a specific segment.

---

## 7. Repair Priority Queue

### `GET /api/repair-priority`
Retrieves actionable maintenance tasks sorted by priority (`-priority`).
- **Filters**: `status` (`PENDING`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`), `severity`.

### `POST /api/repair-priority`
Manually schedules a repair work order.

### `PUT /api/repair-priority/:id`
Updates ticket status or assigns field crew (`assignedTeam`).

---

## 8. Alerts & Notifications

### `GET /api/alerts`
Lists system alerts, equipment offline warnings, and high-severity hazard events.

### `PUT /api/alerts/:id`
Marks an alert as read (`isRead: true`) or resolved (`isResolved: true`).

---

## 9. Analytics & Reporting

- `GET /api/analytics/overview`: High-level command center KPIs.
- `GET /api/analytics/hazards`: Breakdowns by hazard category, severity, and temporal trends.
- `GET /api/analytics/coverage`: Fleet distance surveyed and camera density metrics.
- `GET /api/analytics/road-health`: Aggregate road segment health distribution.
- `GET /api/reports`: Historical analytical reports.
- `POST /api/reports`: Compiles and stores a new analytical summary report.

---

## 10. WebSocket Real-Time Events

Connected clients receive immediate updates without polling:
| Event Name | Direction | Payload Description |
|------------|-----------|---------------------|
| `detection:new` | Server $\rightarrow$ Client | Newly ingested hazard detection |
| `hazard:verified` | Server $\rightarrow$ Client | HazardEvent verified by multiple sources |
| `hazard:updated` | Server $\rightarrow$ Client | HazardEvent attributes updated |
| `alert:new` | Server $\rightarrow$ Client | High/critical hazard or offline warning |
| `rover:location` | Server $\rightarrow$ Client | Real-time GPS coordinate update |
| `rover:telemetry` | Server $\rightarrow$ Client | IMU, battery, temperature & CPU data |
| `rover:status` | Server $\rightarrow$ Client | Rover state transition (e.g. ONLINE) |
| `cctv:status` | Server $\rightarrow$ Client | Camera status or hazard detection update |
| `road-health:update` | Server $\rightarrow$ Client | Updated segment health score & risk tier |
| `repair:update` | Server $\rightarrow$ Client | Repair work order status change |
| `system:status` | Server $\rightarrow$ Client | Demo/simulation broadcast status |
