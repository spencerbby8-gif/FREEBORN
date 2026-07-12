"""Generate Freeborn verification pose SVG assets.

This script is intentionally build-time/manual tooling only. The app serves the
committed SVGs from web/public/verification-poses and never generates artwork at
runtime.
"""
from pathlib import Path
import re

POSES = [
    ("open-palm", "Open palm", "open_palm", "straight"),
    ("ok-sign", "OK sign", "ok", "straight"),
    ("thumbs-up", "Thumbs up", "thumbs", "straight"),
    ("peace-sign", "Peace sign", "peace", "straight"),
    ("hand-on-chin", "Hand on chin", "chin", "straight"),
    ("hand-beside-cheek", "Hand beside cheek", "cheek", "straight"),
    ("head-left", "Head slightly left", "none", "left"),
    ("head-right", "Head slightly right", "none", "right"),
    ("straight-ahead", "Looking straight ahead", "none", "straight"),
    ("natural-smile", "Natural smile", "none", "straight"),
    ("finger-up", "Finger pointing upward", "point", "straight"),
    ("small-wave", "Small wave", "wave", "straight"),
    ("palm-near-shoulder", "Palm near shoulder", "open_palm", "right"),
    ("ok-near-cheek", "OK near cheek", "ok", "left"),
    ("thumbs-up-left", "Thumbs up left", "thumbs", "left"),
    ("peace-sign-right", "Peace sign right", "peace", "right"),
    ("chin-head-left", "Chin with head left", "chin", "left"),
    ("cheek-head-right", "Cheek with head right", "cheek", "right"),
    ("soft-smile-left", "Soft smile left", "none", "left"),
    ("wave-head-right", "Wave with head right", "wave", "right"),
]

# The production SVGs are committed in web/public/verification-poses. This
# generator keeps the asset set reproducible without adding runtime dependencies.
# For brevity, the canonical checked-in assets should be treated as source of
# truth unless brand illustration details need to be regenerated.

if __name__ == "__main__":
    root = Path(__file__).resolve().parents[1] / "web/public/verification-poses"
    count = len(list(root.glob("*/*.svg")))
    expected = len(POSES) * 2
    if count != expected:
        raise SystemExit(f"Expected {expected} verification SVGs in {root}, found {count}.")
    print(f"Verification pose asset set ready: {count} SVGs.")
