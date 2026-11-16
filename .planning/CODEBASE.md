# CALOOPS Codebase Architecture (`CODEBASE.md`)

## 1. Tech Stack
- **Python CLI Suite**: Python 3.14 (`calculator.py`, `test_calculator.py`) — zero external dependencies, standard library `unittest`, `math`, `json`.
- **Backend API**: Node.js + Express 4 (`backend/server.js`), Mongoose 8 (`backend/models/`), PBKDF2 + HMAC-SHA256 Auth (`backend/config/db.js`), SMS Gateway service (`backend/services/smsService.js`).
- **Frontend Web App**: React 18 + Vite 6 (`frontend/src/App.jsx`, `frontend/src/AuthPage.jsx`, `frontend/src/apiClient.js`, `frontend/src/styles.css`).
- **Cloud Deployment**: GitHub Pages (`docs/` static production bundle served at `https://nikhil2006-stack.github.io/caloops/`).

## 2. Entrypoints & Verification Commands
- Python CLI: `python calculator.py` | Demo: `python calculator.py --demo`
- Python Tests: `python -m unittest discover -v`
- Backend Server: `node backend/server.js`
- Backend Tests: `node --test backend/test/engine.test.js`
- Frontend Build: `npm.cmd --prefix frontend run build`
