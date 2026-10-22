"""Shared paths and helpers for the host-link steps (Camera Shops data pipeline, step 1).

Environment:
  CAMERA_RESEARCH  directory of the research master tab CSVs (02_STORES.csv, 07_VENUES.csv, …)   default ./work/research
  CAMERA_WORK      working/cache directory for production responses and outputs                   default ./work/build

All production calls go to the public CityMETER API (landometer.com) with curl and are cached under CAMERA_WORK,
so a rerun on the same cache is deterministic. Outputs feed scripts/build-camera-data.py (--build CAMERA_WORK).
"""
import json, math, os, subprocess, time
from pathlib import Path

API = 'https://landometer.com/api/v2/citymeter-v3'
RESEARCH = Path(os.environ.get('CAMERA_RESEARCH', 'work/research')).resolve()
WORK = Path(os.environ.get('CAMERA_WORK', 'work/build')).resolve()
WORK.mkdir(parents=True, exist_ok=True)

def tile(lng, lat, z):
    n = 2 ** z; lr = math.radians(lat)
    return int((lng + 180) / 360 * n), int((1 - math.log(math.tan(lr) + 1 / math.cos(lr)) / math.pi) / 2 * n)

def t2ll(x, y, z):
    n = 2 ** z
    return x / n * 360 - 180, math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * y / n))))

def merc2ll(x, y):
    return x / 6378137.0 * 180 / math.pi, math.degrees(2 * math.atan(math.exp(y / 6378137.0)) - math.pi / 2)

def fetch(url, cache):
    """Bytes of url, cached at cache (path relative to WORK); empty bytes when the server sends nothing."""
    path = WORK / cache
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists() or path.stat().st_size == 0:
        subprocess.run(['curl', '-s', '-o', str(path), '--max-time', '90', url])
    return path.read_bytes() if path.exists() else b''

def get_json(url, cache):
    path = WORK / cache
    if path.exists():
        return json.loads(path.read_text())
    for _ in range(3):
        try:
            data = json.loads(fetch(url, cache) or b'null')
            if data is not None:
                return data
        except Exception:
            pass
        path.unlink(missing_ok=True); time.sleep(2)
    raise RuntimeError(url)
