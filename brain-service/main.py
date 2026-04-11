"""
TRIBE v2 FastAPI sidecar.

Runs on http://localhost:8000
Accepts POST /predict { "text": "..." }
Returns { "activation": [...] } — 20,484 floats on fsaverage5 surface, or null if unavailable.

Start:
  cd brain-service
  python main.py
"""

from __future__ import annotations

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from model import predict_text, get_model, _model_error

app = FastAPI(title="MindMirror TRIBE v2 Sidecar", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


class PredictRequest(BaseModel):
    text: str


class PredictResponse(BaseModel):
    activation: list[float] | None


@app.on_event("startup")
async def startup():
    # Pre-load the model so the first request is fast
    get_model()


@app.get("/health")
async def health():
    model_ready = get_model() is not None
    return {
        "status": "ok",
        "model_ready": model_ready,
        "error": _model_error,
    }


@app.post("/predict", response_model=PredictResponse)
async def predict(req: PredictRequest):
    if not req.text.strip():
        return PredictResponse(activation=None)

    activation = predict_text(req.text)
    return PredictResponse(activation=activation)


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
