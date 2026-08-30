# server

Backend for Cappr / Shotoku. **Placeholder — no code here yet.**

Per `docs/PRODUCT.md` the backend is **Python (FastAPI)**, a hosted service the
desktop/web clients talk to over HTTP. The core enforcement proxy / policy
engine is a separate **Rust** component. Neither is part of the JavaScript npm
workspace (`client` + `shared`), so this directory is intentionally excluded
from `workspaces` in the root `package.json`.

This is owned by the backend/co-founder track. The frontend is being built first
against mock data in `client/`; the API contract will be pinned to the domain
types in `shared/` once the API shape settles.
