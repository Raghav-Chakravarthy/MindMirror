"""
TRIBE v2 model wrapper.

TRIBE v2 (Trimodal Brain Encoder) from Meta predicts fMRI brain activation
on the fsaverage5 cortical surface (20,484 vertices) from text, audio, or video.

Setup:
  1. Clone https://github.com/facebookresearch/tribev2
  2. pip install -e ./tribev2
  3. The model downloads weights from HuggingFace on first load (~several GB).

This wrapper accepts a text string, runs inference, averages over time, and
returns a list of 20,484 normalized activation values (0–1).
"""

from __future__ import annotations
import os
import numpy as np

_model = None
_model_error: str | None = None


def _load_model():
    global _model, _model_error
    try:
        from tribe import TribeModel  # installed from facebookresearch/tribev2
        _model = TribeModel.from_pretrained("facebook/tribev2")
        _model.eval()
        print("[TRIBE v2] Model loaded successfully.")
    except ImportError:
        _model_error = (
            "TRIBE v2 package not found. "
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


def predict_text(text: str) -> list[float] | None:
    """
    Predict brain activation for a text stimulus.

    Returns a list of 20,484 floats (normalized 0–1) representing
    activation on the fsaverage5 cortical surface, or None if unavailable.
    """
    import torch

    model = get_model()
    if model is None:
        return None

    try:
        with torch.no_grad():
            # TRIBE v2 accepts text via its built-in TTS (LLaMA 3.2)
            # Output shape: (T, 20484) where T = seconds of stimulus
            output = model.predict(text=text)

        if isinstance(output, torch.Tensor):
            arr = output.cpu().numpy()
        else:
            arr = np.array(output)

        # Average over time dimension if present
        if arr.ndim == 2:
            arr = arr.mean(axis=0)  # (20484,)

        # Normalize to [0, 1]
        min_v, max_v = arr.min(), arr.max()
        if max_v > min_v:
            arr = (arr - min_v) / (max_v - min_v)
        else:
            arr = np.zeros_like(arr)

        return arr.tolist()

    except Exception as e:
        print(f"[TRIBE v2] Inference error: {e}")
        return None
