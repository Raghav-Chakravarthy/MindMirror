"""
TRIBE v2 model wrapper.

Predicts fMRI brain activation on the fsaverage5 cortical surface
(20,484 vertices) from text using Meta's TRIBE v2 model.
"""

from __future__ import annotations
import os
import json
import numpy as np
import pandas as pd
from pathlib import Path

if os.environ.get("HF_TOKEN"):
    os.environ["HUGGING_FACE_HUB_TOKEN"] = os.environ["HF_TOKEN"]
    os.environ["HF_HUB_TOKEN"] = os.environ["HF_TOKEN"]

# Cap DataLoader workers BEFORE importing tribev2/neuralset
os.environ["OMP_NUM_THREADS"] = "4"
os.environ["MKL_NUM_THREADS"] = "4"

import torch
import torch.utils.data
_OrigDataLoader = torch.utils.data.DataLoader
class _CappedDataLoader(_OrigDataLoader):
    def __init__(self, *args, **kwargs):
        if kwargs.get("num_workers", 0) > 4:
            kwargs["num_workers"] = 2
        super().__init__(*args, **kwargs)
torch.utils.data.DataLoader = _CappedDataLoader

_model = None
_model_error: str | None = None

CACHE_FOLDER = Path(os.environ.get("TRIBE_CACHE", "./cache"))
PARC_PATH = Path(__file__).parent.parent / "public" / "fsaverage5_parc.json"

_parc_labels: list[int] | None = None
_parc_names: dict[int, str] | None = None


def _load_parcellation():
    global _parc_labels, _parc_names
    if PARC_PATH.exists():
        data = json.loads(PARC_PATH.read_text())
        _parc_labels = data["labels"]
        _parc_names = {int(k): v for k, v in data["label_names"].items()}
        print(f"[TRIBE v2] Loaded parcellation: {len(_parc_names)} regions")


def _force_extractors_cpu(data_cfg):
    """Walk the TRIBE v2 data config and force all extractor devices to CPU."""
    for field_name in data_cfg.model_fields:
        val = getattr(data_cfg, field_name, None)
        if val is None:
            continue
        if hasattr(val, "device"):
            try:
                val.device = "cpu"
            except Exception:
                pass
        if hasattr(val, "image") and hasattr(val.image, "device"):
            try:
                val.image.device = "cpu"
            except Exception:
                pass


def _load_model():
    global _model, _model_error
    try:
        from tribev2.demo_utils import TribeModel

        CACHE_FOLDER.mkdir(parents=True, exist_ok=True)
        _model = TribeModel.from_pretrained(
            "facebook/tribev2",
            cache_folder=str(CACHE_FOLDER),
            device="cpu",
        )
        _force_extractors_cpu(_model.data)
        _load_parcellation()
        print("[TRIBE v2] Model loaded successfully on cpu.")
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
    global _model
    if _model is None and _model_error is None:
        _load_model()
    return _model


def _build_text_events(text: str) -> pd.DataFrame:
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


def get_top_regions(activation: list[float], top_n: int = 5) -> list[dict]:
    """Given a 20,484-element activation array, return the top activated brain regions."""
    if _parc_labels is None or _parc_names is None:
        return []

    arr = np.array(activation)
    labels = np.array(_parc_labels)

    region_activations: dict[int, list[float]] = {}
    for i, label_id in enumerate(labels):
        if label_id == 0:
            continue
        if label_id not in region_activations:
            region_activations[label_id] = []
        region_activations[label_id].append(arr[i])

    region_means = []
    for label_id, values in region_activations.items():
        vals = np.array(values)
        region_means.append({
            "id": int(label_id),
            "name": _parc_names.get(label_id, f"Region_{label_id}"),
            "mean_activation": float(vals.mean()),
            "max_activation": float(vals.max()),
            "vertex_count": len(values),
        })

    region_means.sort(key=lambda x: x["mean_activation"], reverse=True)
    return region_means[:top_n]


def predict_text(text: str) -> dict | None:
    """
    Predict brain activation for a text stimulus.

    Returns a dict with:
      - activation: list of 20,484 floats (normalized 0-1)
      - top_regions: list of top activated brain regions
    Or None if unavailable.
    """
    model = get_model()
    if model is None:
        return None

    try:
        events = _build_text_events(text)

        from neuralset.events.utils import standardize_events
        events = standardize_events(events)

        preds, segments = model.predict(events, verbose=False)

        if preds.ndim == 2:
            arr = preds.mean(axis=0)
        else:
            arr = preds.flatten()

        min_v, max_v = arr.min(), arr.max()
        if max_v > min_v:
            arr = (arr - min_v) / (max_v - min_v)
        else:
            arr = np.zeros_like(arr)

        activation = arr.tolist()
        top_regions = get_top_regions(activation, top_n=8)

        return {
            "activation": activation,
            "top_regions": top_regions,
        }

    except Exception as e:
        print(f"[TRIBE v2] Inference error: {e}")
        import traceback
        traceback.print_exc()
        return None
