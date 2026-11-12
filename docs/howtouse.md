# Developer & User Quickstart Guide — NESTOR AI

> **Operating System**: Windows 11 (PowerShell 7 / Windows PowerShell 5.1)  
> **Backend Runtime**: Python 3.12  
> **Frontend Runtime**: Node.js 20+ / Next.js 16.4.6  
> **Last Verified**: 2026-11-10

---

## 1. Prerequisites

Before running the application, verify that the following runtimes are installed on your workstation:

```powershell
# Verify Python 3.12 installation
python --version

# Verify Node.js (v20+ recommended)
node --version

# Verify npm or pnpm
npm --version
```

---

## 2. Setting Up the Backend

The backend environment resides in `nestor-ai/backend/` and utilizes a dedicated Python virtual environment (`.venv`).

### 2.1 Activate Virtual Environment & Install Dependencies
Open PowerShell:

```powershell
# Navigate to the backend directory
Set-Location "c:\PC\Hardik\Projects\Nestor AI\nestor-ai\backend"

# If .venv does not exist, create it:
# python -m venv .venv

# Activate the virtual environment
.\.venv\Scripts\Activate.ps1

# Install / update backend dependencies
pip install -r requirements.txt
```

> **Tip (Execution Policy)**: If PowerShell blocks script activation with an execution policy error, run:
> ```powershell
> Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
> ```

### 2.2 Configure Environment Variables
Copy `.env.example` to `.env`:
```powershell
Copy-Item .env.example .env
```
Default parameters in `.env`:
```ini
PORT=8000
LOG_LEVEL=info
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

### 2.3 Run the Backend Development Server
```powershell
Set-Location "c:\PC\Hardik\Projects\Nestor AI\nestor-ai\backend"
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```
- **Backend Base URL**: `http://localhost:8000`
- **Interactive Swagger UI**: `http://localhost:8000/docs`
- **ReDoc Documentation**: `http://localhost:8000/redoc`
- **Health Endpoint**: `http://localhost:8000/api/health`

---

## 3. Setting Up the Frontend

The frontend resides in `nestor-ai/frontend/` and runs on Next.js 16 with Turbopack.

### 3.1 Install Dependencies
Open a second PowerShell terminal:

```powershell
Set-Location "c:\PC\Hardik\Projects\Nestor AI\nestor-ai\frontend"
npm install
```

### 3.2 Run the Frontend Development Server
```powershell
Set-Location "c:\PC\Hardik\Projects\Nestor AI\nestor-ai\frontend"
npm run dev
```
- **Frontend Web Application**: `http://localhost:3000`

---

## 4. Running Verification Checks & Tests

Always run these verification commands before committing or deploying code:

### 4.1 Backend Endpoint & Schema Test Suite
```powershell
Set-Location "c:\PC\Hardik\Projects\Nestor AI\nestor-ai\backend"
& ".\.venv\Scripts\python.exe" test_api.py
```
**Expected Output**:
```
Testing GET /api/health...
  Status: degraded
  Model ready: False
  Dataset available: False
Testing GET /api/meta/locations...
  Cities count: 20
  Property types: ['Apartment', 'Villa', 'Independent House', 'Penthouse', 'Studio']
Testing POST /api/valuation (un-trained model)...
  Caught expected HTTPException: 503
Testing Pydantic validation (super < carpet error)...
  Caught expected validation error: ValidationError

>>> ALL BACKEND TESTS PASSED SUCCESSFULLY! <<<
```

### 4.2 Frontend TypeScript Type Check
```powershell
Set-Location "c:\PC\Hardik\Projects\Nestor AI\nestor-ai\frontend"
npx tsc --noEmit
```
**Expected Output**: Clean exit with code `0` (Zero type errors).

### 4.3 Frontend Production Build
```powershell
Set-Location "c:\PC\Hardik\Projects\Nestor AI\nestor-ai\frontend"
npm run build
```
**Expected Output**: Clean Turbopack compilation and static page generation for `/` and `/_not-found`.

---

## 5. Using the Property Valuation Interface

1. **Launch Both Services**: Ensure the FastAPI server is running on port 8000 and the Next.js server is running on port 3000.
2. **Access Dashboard**: Open `http://localhost:3000` in your web browser.
3. **Verify Header Status**:
   - Check the top right badge. It will read **"Model Not Ready"** with an amber indicator dot. This confirms that the frontend is communicating with FastAPI, and that the backend is protecting against un-trained valuation estimates.
4. **Explore Tabs**:
   - **Overview**: Review platform metrics, system diagnostic tiles, and roadmap milestones.
   - **New Valuation**: Fill out the 13 property fields (City, Area, BHK, Floor, etc.).
   - **Submit Valuation**: Click "Run Valuation". The interface displays a clear diagnostic banner explaining that ML training is scheduled for Phase 2.
   - **Market Intelligence**: Review city price distributions and historical housing index trajectories.
   - **Methodology**: Read technical disclosures regarding data sourcing, leakage prevention, and model evaluation protocols.

---

## 6. Troubleshooting Common Errors

### 6.1 `EPERM: operation not permitted` on Windows
- **Cause**: Windows sandbox occasionally locks temporary build folders (`.next/`) when a background node process hasn't fully released a file handle.
- **Solution**: Delete the `.next` directory and rebuild:
  ```powershell
  Set-Location "c:\PC\Hardik\Projects\Nestor AI\nestor-ai\frontend"
  Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
  npm run build
  ```

### 6.2 `Port 8000 or 3000 already in use`
- **Cause**: A previous Uvicorn or Next.js background process is still bound to the port.
- **Solution**: Identify and terminate the lingering process:
  ```powershell
  # Find process on port 8000
  Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | Select-Object OwningProcess -Unique

  # Terminate process by PID (e.g., 12345)
  Stop-Process -Id <PID> -Force
  ```

### 6.3 `ModuleNotFoundError: No module named 'fastapi'`
- **Cause**: Using global Python instead of the virtual environment's Python executable.
- **Solution**: Always use the virtual environment executable:
  ```powershell
  & "c:\PC\Hardik\Projects\Nestor AI\nestor-ai\backend\.venv\Scripts\python.exe" -m uvicorn app.main:app --reload --port 8000
  ```

