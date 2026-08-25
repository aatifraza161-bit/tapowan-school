import sqlite3
import os
import json
import base64
import urllib.request
import urllib.parse
import binascii

db_path = os.path.join(os.path.expanduser('~'), 'AppData', 'Roaming', 'school-management-system', 'school.db')
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("SELECT fullName, className, photo FROM students WHERE photo IS NOT NULL AND photo != ''")
students = cursor.fetchall()

print(f"Found {len(students)} students with photos.")
success_count = 0
fail_count = 0

for student in students:
    full_name, class_name, photo = student
    if not photo.startswith('data:image'):
        print(f"Skipping {full_name}, photo is not base64.")
        continue
    
    print(f"Processing {full_name}...")
    try:
        header, encoded = photo.split(',', 1)
        image_data = base64.b64decode(encoded)
        
        boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
        body = b'--' + boundary.encode() + b'\r\n'
        body += b'Content-Disposition: form-data; name="file"; filename="photo.jpg"\r\n'
        body += b'Content-Type: image/jpeg\r\n\r\n'
        body += image_data
        body += b'\r\n--' + boundary.encode() + b'--\r\n'
        
        req = urllib.request.Request('http://127.0.0.1:8000/extract', data=body)
        req.add_header('Content-Type', f'multipart/form-data; boundary={boundary}')
        req.add_header('Content-Length', str(len(body)))
        
        with urllib.request.urlopen(req) as response:
            if response.status != 200:
                print(f"HTTP Error for {full_name}: {response.status}")
                fail_count += 1
                continue
            
            data = json.loads(response.read().decode('utf-8'))
            if data.get('faces') and len(data['faces']) > 0:
                embedding = data['faces'][0]['embedding']
                
                cursor.execute("DELETE FROM faceEmbeddings WHERE targetType='students' AND name=?", (full_name,))
                cursor.execute("""
                    INSERT INTO faceEmbeddings (targetType, name, tag, descriptorJson)
                    VALUES ('students', ?, ?, ?)
                """, (full_name, class_name or '', json.dumps(embedding)))
                
                print(f"Enrolled {full_name}")
                success_count += 1
            else:
                print(f"No face detected for {full_name}")
                fail_count += 1
                
    except Exception as e:
        print(f"Error processing {full_name}: {e}")

conn.commit()
conn.close()

print(f"\nFinished! Enrolled: {success_count}, Failed/No Face: {fail_count}")
