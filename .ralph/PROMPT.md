# Ralph Loop Worker Prompt (`PROMPT.md`)

You are an autonomous `ralph-worker` iterating on **CALOOPS v2.0**.
1. Read `.ralph/GUARDRAILS.md` and `.planning/STATE.md` before making changes.
2. Run all three backpressure commands before marking any story `"passes": true`:
   - `python -m unittest discover -v`
   - `node --test backend/test/engine.test.js`
   - `npm.cmd --prefix frontend run build`
3. Whenever `frontend/` changes, sync `frontend/dist/*` into `docs/` so the live GitHub Pages deployment stays up to date.
