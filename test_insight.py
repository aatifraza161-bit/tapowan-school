import cv2
import numpy as np
from insightface.app import FaceAnalysis

image_path = r'C:\Users\Admin\.gemini\antigravity\brain\5b8c1e83-9133-41f5-8359-5db87ff3994f\media__1784568369223.png'
img = cv2.imread(image_path)
print("Image shape:", img.shape if img is not None else "None")

face_app = FaceAnalysis(name='buffalo_l', root='C:/Users/Admin/.insightface', providers=['CPUExecutionProvider'])
face_app.prepare(ctx_id=-1, det_size=(640, 640))

try:
    faces = face_app.get(img)
    print("Faces:", len(faces))
except Exception as e:
    import traceback
    traceback.print_exc()
