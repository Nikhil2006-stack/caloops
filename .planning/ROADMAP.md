# CALOOPS v2.0 — Phased Roadmap (`ROADMAP.md`)

## Phase 01: Python CLI & Core Loop/Logic Engine
- **Requirements**: `REQ-CORE-01`, `REQ-CORE-02`
- **Goal**: Deliver `calculator.py` and `test_calculator.py` covering all 15+ CLI modules with unit tests.
- **Success Criteria**: `python -m unittest discover -v` exits 0 (`10/10` tests pass).

## Phase 02: Full-Stack MERN Application
- **Requirements**: `REQ-CORE-01`, `REQ-CORE-02`
- **Goal**: Build Express REST API, Mongoose models (`Calculation`, `QuizScore`), hybrid JSON fallback, and React 18 + Vite UI with interactive step-by-step debugger.
- **Success Criteria**: `node --test backend/test/engine.test.js` passes all engine tests.

## Phase 03: Authentication & Mobile OTP Login Portal
- **Requirements**: `REQ-AUTH-01`, `REQ-AUTH-02`, `REQ-AUTH-03`
- **Goal**: Implement `User` model, `smsService.js`, `/api/auth/*` endpoints, and `AuthPage.jsx` supporting Username/Email/Mobile login, 6-digit Mobile OTP login, Registration, and Forgot Password.
- **Success Criteria**: End-to-end auth & OTP unit test passes in `backend/test/engine.test.js`.

## Phase 04: 24/7 Cloud Deployment, CodeRabbit Security Hardening & Ponytail Debloat
- **Requirements**: `REQ-CLOUD-01`
- **Goal**: Deploy to GitHub Pages (`/docs`), harden token/password verification with `crypto.timingSafeEqual`, and eliminate duplicate engine code between backend and frontend.
- **Success Criteria**: Zero duplicated engine files, timing-safe auth checks, and live HTTP 200 on `https://nikhil2006-stack.github.io/caloops/`.
