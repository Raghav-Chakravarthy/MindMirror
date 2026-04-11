"""
TRIBE v2 FastAPI sidecar.

Runs on http://localhost:8000
Accepts POST /predict { "text": "..." }
Returns { "activation": [...], "top_regions": [...] }
"""

from __future__ import annotations

import asyncio
import hashlib
import json
import os
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import uvicorn
from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from model import predict_text, get_model, _model_error

app = FastAPI(title="MindMirror TRIBE v2 Sidecar", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

CACHE_DIR = Path("./prediction_cache")
CACHE_DIR.mkdir(exist_ok=True)

executor = ThreadPoolExecutor(max_workers=2)


def _cache_key(text: str) -> str:
    return hashlib.sha256(text.strip().lower().encode()).hexdigest()[:16]


def _get_cached(text: str) -> dict | None:
    path = CACHE_DIR / f"{_cache_key(text)}.json"
    if path.exists():
        return json.loads(path.read_text())
    return None


def _set_cached(text: str, result: dict):
    path = CACHE_DIR / f"{_cache_key(text)}.json"
    path.write_text(json.dumps(result))


class PredictRequest(BaseModel):
    text: str


class WarmupRequest(BaseModel):
    texts: list[str]


@app.on_event("startup")
async def startup():
    get_model()


@app.get("/health")
async def health():
    model_ready = get_model() is not None
    cached_count = len(list(CACHE_DIR.glob("*.json")))
    return {
        "status": "ok",
        "model_ready": model_ready,
        "cached_predictions": cached_count,
        "error": _model_error,
    }


@app.post("/predict")
async def predict(req: PredictRequest):
    if not req.text.strip():
        return {"activation": None, "top_regions": [], "cached": False}

    cached = _get_cached(req.text)
    if cached is not None:
        cached["cached"] = True
        return cached

    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(executor, predict_text, req.text)
    if result is not None:
        _set_cached(req.text, result)
        result["cached"] = False
        return result
    return {"activation": None, "top_regions": [], "cached": False}


def _warmup_topics(texts: list[str]):
    for text in texts:
        if _get_cached(text) is not None:
            print(f"[WARMUP] Already cached: {text}")
            continue
        print(f"[WARMUP] Predicting: {text}")
        result = predict_text(text)
        if result is not None:
            _set_cached(text, result)
            print(f"[WARMUP] Cached: {text} ({len(result['activation'])} vertices, {len(result['top_regions'])} regions)")
        else:
            print(f"[WARMUP] Failed: {text}")


@app.post("/warmup")
async def warmup(req: WarmupRequest, background_tasks: BackgroundTasks):
    already_cached = sum(1 for t in req.texts if _get_cached(t) is not None)
    to_compute = [t for t in req.texts if _get_cached(t) is None]
    background_tasks.add_task(_warmup_topics, to_compute)
    return {
        "status": "warming up",
        "total": len(req.texts),
        "already_cached": already_cached,
        "queued": len(to_compute),
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False, workers=1)
