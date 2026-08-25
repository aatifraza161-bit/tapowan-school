"""
========================================================================================
🏫 TAPOWAN PUBLIC SCHOOL (TPS) - AI FACE RECOGNITION & ATTENDANCE SYSTEM
========================================================================================
Runs on Google Colab (Free GPU / CPU)
Connects directly to Turso Cloud Database: tapowan-im-aatif.aws-ap-northeast-1.turso.io
========================================================================================
"""

import os
import sys
import json
import time
import requests
import datetime
import numpy as np
import cv2
from io import BytesIO
from PIL import Image

# --------------------------------------------------------------------------------------
# 1. DATABASE CONFIGURATION (Turso Cloud)
# --------------------------------------------------------------------------------------
TURSO_URL = 'https://tapowan-im-aatif.aws-ap-northeast-1.turso.io/v2/pipeline'
TURSO_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODY1MTcyOTQsImlkIjoiMDE5ZmY0YWUtM2YwMS03YTYwLWI4NTgtMWQ4M2JlYjJkNzJkIiwia2lkIjoiblRLTmdsNnYyaFQ4LTlhT09uQV9JdERDc3BTdk9iejhSYzNuY0hSNUhOVSIsInJpZCI6ImZmMWI4YTE5LWFhZTgtNGM5MS1hNjFhLTlkMTY1NTQ1OTEyOCJ9.a-w2gyEauZrfLwqWAMh2QLqHmqOxIsziDu9WRBrCPmLaoZThvoDlPdW4VjQ6ST5hRYJj1E1R0sJELyNPg4zrBQ'

def execute_turso_query(sql_statement, args=[]):
    """Execute SQL query against Turso Cloud Database over HTTP Pipeline"""
    typed_args = []
    for arg in args:
        if isinstance(arg, int):
            typed_args.append({"type": "integer", "value": str(arg)})
        elif isinstance(arg, float):
            typed_args.append({"type": "float", "value": str(arg)})
        elif arg is None:
            typed_args.append({"type": "null"})
        else:
            typed_args.append({"type": "text", "value": str(arg)})

    payload = {
        "requests": [
            {
                "type": "execute",
                "stmt": {
                    "sql": sql_statement,
                    "args": typed_args
                }
            },
            {"type": "close"}
        ]
    }
    
    headers = {
        "Authorization": f"Bearer {TURSO_TOKEN}",
        "Content-Type": "application/json"
    }
    
    res = requests.post(TURSO_URL, json=payload, headers=headers)
    if not res.ok:
        raise Exception(f"Turso Error {res.status_code}: {res.text}")
    
    data = res.json()
    try:
        rows = data["results"][0]["response"]["result"]["rows"]
        cols = [c["name"] for c in data["results"][0]["response"]["result"]["cols"]]
        clean_rows = []
        for r in rows:
            clean_rows.append({cols[i]: r[i].get("value") for i in range(len(cols))})
        return clean_rows
    except Exception:
        return []

def get_today_ist():
    ist_offset = datetime.timezone(datetime.timedelta(hours=5, minutes=30))
    return datetime.datetime.now(ist_offset).strftime('%Y-%m-%d')

def get_current_time_ist():
    ist_offset = datetime.timezone(datetime.timedelta(hours=5, minutes=30))
    return datetime.datetime.now(ist_offset).strftime('%I:%M:%S %p')

# --------------------------------------------------------------------------------------
# 2. FACE RECOGNITION CORE ENGINE
# --------------------------------------------------------------------------------------
import face_recognition

known_face_encodings = []
known_face_metadata = []

def sync_student_face_database():
    """Download student photos from Turso DB and generate 128-d face embeddings"""
    global known_face_encodings, known_face_metadata
    known_face_encodings = []
    known_face_metadata = []

    print("🔄 Fetching students from Turso Cloud Database...")
    students = execute_turso_query("SELECT id, admissionNo, rollNo, fullName, className, photoUrl, photo FROM students WHERE photoUrl IS NOT NULL OR photo IS NOT NULL;")
    print(f"📋 Found {len(students)} students with photo records.")

    for idx, s in enumerate(students):
        name = s.get('fullName') or 'Student'
        adm = s.get('admissionNo') or f"ADM-{s.get('id')}"
        cls = s.get('className') or 'General'
        roll = s.get('rollNo') or ''
        img_url = s.get('photoUrl') or s.get('photo')

        if not img_url:
            continue

        try:
            # If base64 or URL
            if img_url.startswith('http'):
                resp = requests.get(img_url, timeout=5)
                img = Image.open(BytesIO(resp.content)).convert('RGB')
            elif 'base64,' in img_url:
                import base64
                b64_data = img_url.split('base64,')[1]
                img_data = base64.b64decode(b64_data)
                img = Image.open(BytesIO(img_data)).convert('RGB')
            else:
                continue

            img_np = np.array(img)
            encodings = face_recognition.face_encodings(img_np)
            if len(encodings) > 0:
                known_face_encodings.append(encodings[0])
                known_face_metadata.append({
                    "id": s.get('id'),
                    "admissionNo": adm,
                    "rollNo": roll,
                    "fullName": name,
                    "className": cls
                })
                print(f"  [{idx+1}/{len(students)}] ✅ Enrolled: {name} ({cls} | Roll: {roll})")
            else:
                print(f"  [{idx+1}/{len(students)}] ⚠️ No face detected in photo for: {name}")
        except Exception as e:
            print(f"  [{idx+1}/{len(students)}] ❌ Error downloading photo for {name}: {e}")

    print(f"\n🎉 Successfully loaded {len(known_face_encodings)} face models into memory!")
    return len(known_face_encodings)

# --------------------------------------------------------------------------------------
# 3. ATTENDANCE MARKING LOGIC
# --------------------------------------------------------------------------------------
def mark_attendance_in_db(student_meta, confidence=0.0):
    """Mark attendance in Turso Cloud DB for today"""
    today_date = get_today_ist()
    curr_time = get_current_time_ist()
    name = student_meta['fullName']
    adm = student_meta['admissionNo']
    cls = student_meta['className']
    roll = student_meta['rollNo']

    # Check if already marked today
    existing = execute_turso_query(
        "SELECT id FROM attendance WHERE date = ? AND studentName = ? AND className = ?;",
        [today_date, name, cls]
    )

    if existing:
        return f"ℹ️ Already Marked: {name} ({cls})"

    # Insert into attendance table
    execute_turso_query(
        """INSERT INTO attendance (date, className, studentName, rollNo, status, arrivalTime, remarks) 
           VALUES (?, ?, ?, ?, 'present', ?, ?);""",
        [today_date, cls, name, roll, curr_time, f"AI Face Match ({confidence:.1f}% match)"]
    )
    return f"✅ Marked PRESENT: {name} ({cls} | Roll {roll}) at {curr_time}"

# --------------------------------------------------------------------------------------
# 4. RECOGNIZE FACES IN ANY IMAGE (WebCam / Photo / Classroom Group)
# --------------------------------------------------------------------------------------
def process_face_recognition(image_np, tolerance=0.52):
    """Detect and recognize all faces in an image and mark attendance"""
    if len(known_face_encodings) == 0:
        return image_np, ["Database not initialized. Please run sync first."]

    # Convert RGB
    rgb_image = cv2.cvtColor(image_np, cv2.COLOR_BGR2RGB) if len(image_np.shape) == 3 and image_np.shape[2] == 3 else image_np

    # Detect faces
    face_locations = face_recognition.face_locations(rgb_image)
    face_encodings = face_recognition.face_encodings(rgb_image, face_locations)

    results_log = []
    output_image = image_np.copy()

    for (top, right, bottom, left), face_encoding in zip(face_locations, face_encodings):
        face_distances = face_recognition.face_distance(known_face_encodings, face_encoding)
        best_match_idx = np.argmin(face_distances)
        best_distance = face_distances[best_match_idx]

        if best_distance < tolerance:
            matched_student = known_face_metadata[best_match_idx]
            match_percent = max(0, min(100, (1.0 - best_distance) * 100))
            name_label = f"{matched_student['fullName']} ({matched_student['className']})"

            # Mark attendance
            status_msg = mark_attendance_in_db(matched_student, confidence=match_percent)
            results_log.append(f"{name_label} - Match: {match_percent:.1f}% | {status_msg}")

            # Draw Green Box
            cv2.rectangle(output_image, (left, top), (right, bottom), (0, 220, 0), 3)
            cv2.rectangle(output_image, (left, bottom - 35), (right, bottom), (0, 220, 0), cv2.FILLED)
            cv2.putText(output_image, name_label, (left + 6, bottom - 10), cv2.FONT_HERSHEY_DUPLEX, 0.7, (255, 255, 255), 2)
        else:
            results_log.append("Unknown Person / Unregistered Student")
            # Draw Red Box
            cv2.rectangle(output_image, (left, top), (right, bottom), (0, 0, 255), 3)
            cv2.rectangle(output_image, (left, bottom - 30), (right, bottom), (0, 0, 255), cv2.FILLED)
            cv2.putText(output_image, "Unknown", (left + 6, bottom - 8), cv2.FONT_HERSHEY_DUPLEX, 0.7, (255, 255, 255), 2)

    return output_image, results_log

print("🚀 Tapowan Face Recognition Engine Ready.")
