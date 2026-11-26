# FocusLamp FastAPI Backend Structure

This directory provides the Python / FastAPI / Pydantic / Pandas / NumPy / Scikit-learn scaffolding prepared for FocusLamp's Python API service.

## Security & Deployment
- Production deployment must enforce server-side authentication (JWT/OAuth), per-user database authorization, HTTPS, rate limiting, and proper secret management via environment variables.

## Local Setup (when running Python 3.11+)
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
