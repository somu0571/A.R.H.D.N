# Raspberry Pi & Rover Sensing Module Integration

This document specifies the software architecture, hardware wiring, sensor polling routines, and backend communication protocols for the physical ARHDN rover and vehicle edge modules.

## 1. Hardware Architecture

```
                       +-----------------------+
                       |     Raspberry Pi      |
                       |    (4B / 5 / CM4)     |
                       +-----------+-----------+
                                   |
         +-----------------+-------+-------+-----------------+
         |                 |               |                 |
         ▼                 ▼               ▼                 ▼
   +-----------+     +-----------+   +-----------+     +-----------+
   |  Camera   |     |    GPS    |   |  6-DOF    |     |  Network  |
   | CSI / USB |     | UART/USB  |   |    IMU    |     | 4G / LTE  |
   | (Frames)  |     | (NMEA)    |   | I2C (MPU) |     |  Wi-Fi    |
   +-----------+     +-----------+   +-----------+     +-----------+
         |                 |               |                 |
         +-----------------+-------+-------+-----------------+
                                   |
                                   ▼
                      +-----------------------+
                      |   Python Edge Agent   |
                      |  - OpenCV pipeline    |
                      |  - YOLOv12 inference  |
                      |  - Sensor fusion      |
                      +-----------+-----------+
                                  |
                                  ▼ (HTTPS / WSS)
                      +-----------------------+
                      |   ARHDN Backend API   |
                      +-----------------------+
```

---

## 2. Sensor Integration Specifications

### 2.1 Camera Module
- **Interface**: MIPI CSI-2 ribbon cable or USB 3.0 UVC.
- **Resolution**: $1920 \times 1080$ capture, downscaled in OpenCV to $640 \times 640$ letterbox for inference.
- **Orientation**: Forward-tilted downward at approximately $30^{\circ}$ angle toward pavement surface.

### 2.2 GPS Module (e.g., NEO-6M / NEO-M8N)
- **Interface**: UART (`/dev/ttyAMA0` or `/dev/ttyUSB0`) at 9600 baud.
- **Protocol**: NMEA 0183 ($GPRMC and $GPGGA sentences).
- **Extracted Fields**:
  - `latitude`: Decimal degrees (WGS84).
  - `longitude`: Decimal degrees (WGS84).
  - `altitude`: Meters above sea level.
  - `speed`: Ground speed in km/h.
  - `heading`: Compass heading in degrees ($0^{\circ}–360^{\circ}$).
  - `timestamp`: UTC ISO 8601 string.

### 2.3 6-DOF IMU Module (e.g., MPU-6050 / MPU-9250)
- **Interface**: I2C bus (`/dev/i2c-1`) at address `0x68`.
- **Sensors**:
  - **3-Axis Accelerometer**: $[a_x, a_y, a_z]$ in $m/s^2$ or $g$.
  - **3-Axis Gyroscope**: $[\omega_x, \omega_y, \omega_z]$ in $\text{deg}/s$.
- **Motion Context Heuristic**:
  - If $|a_z - 9.8| > 3.5\text{ m/s}^2$ $\rightarrow$ `BUMP` (Physical shock correlate).
  - If $|a_x| > 2.5\text{ m/s}^2$ with decelerating sign $\rightarrow$ `BRAKING`.
  - If $|\omega_z| > 15^{\circ}/\text{s}$ $\rightarrow$ `TURNING`.
  - If $\text{speed} < 1.0\text{ km/h}$ $\rightarrow$ `STATIONARY`.
  - Otherwise $\rightarrow$ `MOVING`.

---

## 3. Edge Agent Python Script (Reference Implementation)

Below is the standalone lightweight client for Raspberry Pi:

```python
import time
import requests
import json
import cv2

# Configuration
BACKEND_URL = "http://<BACKEND_HOST>:5000/api/detections"
AI_SERVICE_URL = "http://localhost:8000/predict"
ROVER_ID = "ARHDN-01"

def capture_and_transmit(camera, gps_client, imu_client):
    ret, frame = camera.read()
    if not ret:
        return

    # 1. Acquire GPS & IMU telemetry (graceful fallback if sensors offline)
    gps_data = gps_client.read_coords() or {
        "latitude": 28.6139, "longitude": 77.2090, "speed": 25.0, "heading": 90.0
    }
    imu_data = imu_client.read_motion() or {"motionContext": "MOVING"}

    # 2. Invoke local YOLOv12 microservice
    _, img_encoded = cv2.imencode(".jpg", frame)
    files = {"file": ("frame.jpg", img_encoded.tobytes(), "image/jpeg")}
    params = {"speed_kmh": gps_data.get("speed", 0)}

    try:
        ai_resp = requests.post(AI_SERVICE_URL, files=files, params=params, timeout=1.0)
        prediction = ai_resp.json()
    except Exception as e:
        print(f"Edge AI error: {e}")
        return

    # 3. Transmit if valid hazard detected
    if prediction.get("hazardType") not in (None, "none"):
        payload = {
            "sourceType": "MOBILE_ROVER",
            "sourceId": ROVER_ID,
            "roverId": ROVER_ID,
            "hazardType": prediction["hazardType"],
            "confidence": prediction["confidence"],
            "severity": prediction["severity"].upper(),
            "boundingBox": prediction.get("boundingBox", []),
            "latitude": gps_data["latitude"],
            "longitude": gps_data["longitude"],
            "speed": gps_data.get("speed"),
            "heading": gps_data.get("heading"),
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "processingTimeMs": prediction.get("processingTimeMs", 100),
            "modelVersion": prediction.get("modelVersion", "YOLOv12")
        }

        try:
            requests.post(BACKEND_URL, json=payload, timeout=2.0)
            print(f"Transmitted {payload['hazardType']} at {payload['latitude']}, {payload['longitude']}")
        except Exception as e:
            print(f"Backend uplink failed: {e}")
```

---

## 4. Fault Tolerance & Simulation Fallback
The software design handles edge failure modes gracefully:
- **Missing GPS Lock**: Transmits fallback coordinates or marks GPS status `DISCONNECTED` while continuing visual sensing.
- **Disconnected IMU**: Defaults `motionContext` to `MOVING` without halting detection pipeline.
- **Backend Disconnection**: Caches detection JSON records to local flash storage until network connectivity is re-established.
