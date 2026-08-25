# -*- coding: utf-8 -*-
# Tapowan Public School - Automated Kaggle GPU InsightFace Server
# Runs 100% in Google's cloud on Nvidia T4 GPU and syncs automatically to Turso DB.

import os
import sys
import subprocess
import time
import re
import urllib.request
import requests

TURSO_URL = 'https://tapowan-im-aatif.aws-ap-northeast-1.turso.io/v2/pipeline'
TURSO_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODY1MTcyOTQsImlkIjoiMDE5ZmY0YWUtM2YwMS03YTYwLWI4NTgtMWQ4M2JlYjJkNzJkIiwia2lkIjoiblRLTmdsNnYyaFQ4LTlhT09uQV9JdERDc3BTdk9iejhSYzNuY0hSNUhOVSIsInJpZCI6ImZmMWI4YTE5LWFhZTgtNGM5MS1hNjFhLTlkMTY1NTQ1OTEyOCJ9.a-w2gyEauZrfLwqWAMh2QLqHmqOxIsziDu9WRBrCPmLaoZThvoDlPdW4VjQ6ST5hRYJj1E1R0sJELyNPg4zrBQ'

def log(msg):
    print(msg, flush=True)

def update_turso(url):
    log(f"Registering URL in Turso DB: {url}")
    payload = {
        "requests": [
            {"type": "execute", "stmt": {"sql": "DELETE FROM settings WHERE key = 'colab_insightface_url';"}},
            {"type": "execute", "stmt": {"sql": "INSERT INTO settings (key, value, category) VALUES ('colab_insightface_url', ?, 'AI');", "args": [{"type": "text", "value": url}]}},
            {"type": "close"}
        ]
    }
    try:
        r = requests.post(TURSO_URL, json=payload, headers={"Authorization": f"Bearer {TURSO_TOKEN}", "Content-Type": "application/json"}, timeout=15)
        if r.ok:
            log("SUCCESS: Auto-registered with Turso DB!")
        else:
            log(f"Turso response error: {r.status_code} {r.text}")
    except Exception as e:
        log(f"Could not update Turso DB: {e}")

log("[1/4] Installing Python dependencies...")
subprocess.run([sys.executable, "-m", "pip", "install", "-q", "fastapi", "uvicorn", "insightface", "onnxruntime-gpu", "opencv-python-headless", "pillow", "requests", "python-multipart"], check=False)

log("[2/4] Downloading standalone Cloudflare Tunnel binary...")
try:
    if not os.path.exists("cloudflared"):
        urllib.request.urlretrieve("https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64", "cloudflared")
        os.chmod("cloudflared", 0o777)
        log("Cloudflare binary ready.")
except Exception as e:
    log(f"Error downloading cloudflared: {e}")

log("[3/4] Writing FastAPI Server...")
with open("app.py", "w") as f:
    f.write('''# -*- coding: utf-8 -*-
import os, numpy as np, cv2
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from insightface.app import FaceAnalysis

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("Initializing InsightFace buffalo_l on Nvidia GPU...", flush=True)
face_app = FaceAnalysis(name='buffalo_l', providers=['CUDAExecutionProvider', 'CPUExecutionProvider'])
face_app.prepare(ctx_id=0, det_size=(640, 640))
print("InsightFace ready on GPU!", flush=True)

@app.get("/")
@app.get("/status")
def status():
    return {"status": "ready", "engine": "Kaggle GPU 512-D ArcFace"}

@app.post("/extract")
async def extract(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        return {"faces": []}
    faces = face_app.get(img)
    out = []
    for f in faces:
        x, y, x2, y2 = f.bbox.astype(int)
        emb = f.embedding
        norm = np.linalg.norm(emb)
        if norm > 0:
            emb = emb / norm
        out.append({
            "box": [int(x), int(y), int(max(1, x2-x)), int(max(1, y2-y))],
            "score": float(f.det_score) if hasattr(f, 'det_score') else 0.95,
            "embedding": emb.tolist()
        })
    return {"faces": out}
''')

log("[4/4] Launching Server and Cloudflare Tunnel...")
server_proc = subprocess.Popen([sys.executable, "-m", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"])

tunnel_cmd = ["./cloudflared", "tunnel", "--url", "http://127.0.0.1:8000", "--no-autoupdate"]
tunnel_proc = subprocess.Popen(
    tunnel_cmd,
    stdout=subprocess.PIPE,
    stderr=subprocess.STDOUT,
    text=True,
    bufsize=1
)

active_url = None
start_time = time.time()
while time.time() - start_time < 90:
    line = tunnel_proc.stdout.readline()
    if not line:
        time.sleep(0.5)
        continue
    log(line.strip())
    match = re.search(r'https://[a-zA-Z0-9-]+\.trycloudflare\.com', line)
    if match:
        active_url = match.group(0)
        log("\n" + "="*65)
        log("YOUR LIVE KAGGLE GPU INSIGHTFACE URL IS:")
        log("URL: " + active_url)
        log("="*65 + "\n")
        update_turso(active_url)
        break

log("GPU Server active and serving requests...")
try:
    while True:
        time.sleep(60)
except KeyboardInterrupt:
    pass
