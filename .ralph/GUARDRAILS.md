# Ralph Loop Guardrails ("Signs")

- **SIGN-001 (Windows PowerShell `npm.cmd`)**: PowerShell execution policy blocks `npm.ps1`. Always invoke `npm.cmd` instead of `npm` in shell commands.
- **SIGN-002 (Single Source of Truth for Engine)**: Never duplicate `backend/engine/caloopsEngine.js` inside `frontend/src/`. Export it as a UMD/CommonJS-compatible module that Vite can import directly.
- **SIGN-003 (Constant-Time Auth Verification)**: Always use `crypto.timingSafeEqual` on equal-length buffers when comparing password hashes or HMAC token signatures in `backend/config/db.js`.
- **SIGN-004 (GitHub Pages `/docs` Sync)**: After running `npm.cmd --prefix frontend run build`, copy `frontend/dist/*` to `docs/` and keep `docs/.nojekyll` present.
- **SIGN-005 (Vite CommonJS Interop for Shared Backend Engine)**: Include `build.commonjsOptions.include: [/caloopsEngine/, /node_modules/]` in `frontend/vite.config.js` so Rollup converts `backend/engine/caloopsEngine.js` `module.exports` when imported by `frontend/src/apiClient.js`.
