---
title: MindMirror Brain Service
emoji: 🧠
colorFrom: purple
colorTo: blue
sdk: docker
app_port: 7860
pinned: false
---

# MindMirror Brain Service

FastAPI sidecar for [MindMirror](https://github.com/Raghav-Chakravarthy/MindMirror) running Meta's TRIBE v2 brain encoding model. Predicts fMRI cortical surface activation (20,484 vertices) from text.

## Endpoints

| Method | Path | Body | Returns |
|--------|------|------|---------|
| GET | `/health` | — | model status + cache count |
| POST | `/predict` | `{"text": "..."}` | `{"activation": [...], "top_regions": [...]}` |
| POST | `/warmup` | `{"texts": [...]}` | pre-caches predictions in background |

## First startup

Model weights (~2 GB) are downloaded from `facebook/tribev2` on HuggingFace Hub on cold start. Subsequent requests use a local prediction cache.
