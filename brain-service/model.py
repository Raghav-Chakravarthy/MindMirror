"""
TRIBE v2 model wrapper.

TRIBE v2 (Trimodal Brain Encoder) from Meta predicts fMRI brain activation
on the fsaverage5 cortical surface (20,484 vertices) from text, audio, or video.

Setup:
  1. Clone https://github.com/facebookresearch/tribev2
  2. pip install -e ./tribev2
  3. The model downloads weights from HuggingFace on first load (~1 GB).

This wrapper accepts a text string, creates a minimal events DataFrame,
runs inference, averages over time, and returns a list of 20,484
normalized activation values (0-1).
"""

from __future__ import annotations
import os
import tempfile
import numpy as np
import pandas as pd
from pathlib import Path

_model = None
_model_error: str | None = None

CACHE_FOLDER = Path(os.environ.get("TRIBE_CACHE", "./cache"))


def _load_model():
    global _model, _model_error
    try:
        from tribev2.demo_utils import TribeModel

        CACHE_FOLDER.mkdir(parents=True, exist_ok=True)
        _model = TribeModel.from_pretrained(
            "facebook/tribev2",
            cache_folder=str(CACHE_FOLDER),
            device="auto",
        )
        print("[TRIBE v2] Model loaded successfully.")
    except ImportError as e:
        _model_error = (
            f"TRIBE v2 package not found ({e}). "
            "Clone https://github.com/facebookresearch/tribev2 and run: "
            "pip install -e ./tribev2"
        )
        print(f"[TRIBE v2] WARNING: {_model_error}")
    except Exception as e:
        _model_error = str(e)
        print(f"[TRIBE v2] WARNING: Failed to load model: {e}")


def get_model():
    """Return the loaded model, or None if unavailable."""
    global _model
    if _model is None and _model_error is None:
        _load_model()
    return _model


def _build_text_events(text: str) -> pd.DataFrame:
    """Build a minimal events DataFrame for text input.

    Creates word-level events with context fields that TRIBE v2's
    text feature extractor (LLaMA 3.2) expects.
    """
    words = text.split()
    rows = []
    t = 0.0
    for i, word in enumerate(words):
        rows.append({
            "type": "Word",
            "text": word,
            "start": t,
            "duration": 0.3,
            "timeline": "default",
            "subject": "default",
            "sentence": text,
            "context": text,
            "sequence_id": 0,
        })
        t += 0.35
    return pd.DataFrame(rows)


def predict_text(text: str) -> list[float] | None:
    """
    Predict brain activation for a text stimulus.

    Returns a list of 20,484 floats (normalized 0-1) representing
    activation on the fsaverage5 cortical surface, or None if unavailable.
    """
    import torch

    model = get_model()
    if model is None:
        return None

    try:
        events = _build_text_events(text)

        from neuralset.events.utils import standardize_events
        events = standardize_events(events)

        preds, segments = model.predict(events, verbose=False)

        # preds shape: (n_segments, n_vertices)
        if preds.ndim == 2:
            arr = preds.mean(axis=0)
        else:
            arr = preds.flatten()

        # Normalize to [0, 1]
        min_v, max_v = arr.min(), arr.max()
        if max_v > min_v:
            arr = (arr - min_v) / (max_v - min_v)
        else:
            arr = np.zeros_like(arr)

        return arr.tolist()

    except Exception as e:
        print(f"[TRIBE v2] Inference error: {e}")
        import traceback
        traceback.print_exc()
        return None
