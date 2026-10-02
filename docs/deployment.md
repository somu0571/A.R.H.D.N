# ARHDN Deployment Guide

This document describes deployment options for the ARHDN software platform, covering Docker Compose orchestration, bare-metal server deployment, and Raspberry Pi edge agent setup.

---

## 1. Quickstart via Docker Compose

The fastest way to deploy the entire cloud/municipal platform stack is using Docker Compose.

### Prerequisites
- Docker Engine $\ge 24.0$
- Docker Compose $\ge 2.20$
- Minimum 4GB RAM, 10GB free disk space

### Commands
```bash
# Clone the repository
git clone <repo-url> arhdn
cd arhdn

# Copy and configure environment variables
cp .env.example .env

# Build and launch all containers (MongoDB, Backend, AI Service, Frontend)
docker compose up --build -d

# Check running services
docker compose ps

# View unified logs
docker compose logs -f
```

The services will be available at:
- **Frontend Command Center**: `http://localhost:5173`
- **Node/Express Backend API**: `http://localhost:5000`
- **FastAPI AI Service**: `http://localhost:8000`
- **MongoDB**: `localhost:27017`

---

## 2. Bare-Metal / Local Development Setup

### 2.1 MongoDB
Ensure MongoDB is running locally on port `27017` or supply a cloud connection string in `.env`:
```bash
# Ubuntu/Debian
sudo systemctl start mongod
```

### 2.2 Express Backend
```bash
cd backend
npm install
npm run seed     # Populates default admin/operator user accounts
npm run dev      # Starts server on port 5000 with nodemon
```

### 2.3 Python AI Inference Service
```bash
cd ai
python -m venv venv
# Linux/macOS:
source venv/bin/activate
# Windows PowerShell:
.\venv\Scripts\Activate.ps1

pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2.4 React Vite Frontend
```bash
cd frontend
npm install
npm run dev      # Starts Vite dev server on port 5173
```

---

## 3. Edge Sensing Unit (Raspberry Pi) Setup

1. **Operating System**: Raspberry Pi OS (64-bit Lite or Desktop based on Debian Bookworm).
2. **Enable Hardware Interfaces**:
   ```bash
   sudo raspi-config
   # Navigate to Interface Options -> Enable Camera, I2C, and Serial Port (disable serial console, enable serial port hardware)
   ```
3. **Install System Dependencies**:
   ```bash
   sudo apt update
   sudo apt install -y python3-pip python3-opencv libatlas-base-dev git
   ```
4. **Deploy Edge Inference Service**:
   Run the `ai` service locally on the Pi (or execute Python scripts that stream lightweight inferences to a vehicle onboard compute module).
5. **Configure Network Uplink**:
   Ensure 4G USB modem (e.g. Huawei E3372 or SIM7600 HAT) or municipal Wi-Fi auto-reconnect is configured with systemd networkd.

---

## 4. Production Security Hardening

- **JWT Secrets**: Replace `JWT_SECRET` in `.env` with a 256-bit cryptographically secure key:
  ```bash
  openssl rand -hex 32
  ```
- **HTTPS & SSL**: Terminate TLS using an NGINX reverse proxy or Cloudflare in front of the Vite frontend and Express API.
- **MongoDB Authentication**: Restrict MongoDB access with role-based database authentication and disable binding to `0.0.0.0`.
- **CORS Allowlist**: Set `CLIENT_URL` explicitly to your production domain (e.g., `https://arhdn.city.gov`).
