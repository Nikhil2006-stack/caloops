# CALOOPS v2.0 — Project Specification (`PROJECT.md`)

## Vision
Provide an interactive, educational, full-stack scientific calculator and algorithmic sandbox that teaches **programming logic (`if/elif/else`, boolean algebra, bitwise operations)** and **loop paradigms (`for`, `while`, 2D/3D nested loops, Shunting-Yard stack loops, and convergence loops)** through live step-by-step iteration traces.

## Architectural Conventions
1. **Single-Source Algorithmic Parity**: Every calculation returns `{ result, steps, loopType, complexity }` so the user always sees both the answer and the exact loop execution trace.
2. **Zero-Friction Persistence**: Backend operations persist to MongoDB via Mongoose when `mongod` is available and automatically fall back to `backend/data/caloops_db.json` (or `localStorage` on static cloud hosts).
3. **Security at Trust Boundaries**: Passwords use salted PBKDF2-SHA256; session tokens use HMAC-SHA256 verified with `crypto.timingSafeEqual`.
