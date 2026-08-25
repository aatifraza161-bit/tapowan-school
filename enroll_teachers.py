import sqlite3
import os
import json
import base64
import urllib.request
import urllib.parse
import binascii

db_path = os.path.join(os.path.expanduser('~'), 'AppData', 'Roaming', 'school-management-system', 'school.db')
if not os.path.exists(db_path):
    db_path = os.path.join(os.path.expanduser('~'), 'AppData', 'Roaming', 'Tapowan Public School System', 'school.db')

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    cursor.execute("ALTER TABLE teachers ADD COLUMN photo TEXT")
except:
    pass # Column might already exist

photos_dir = r"C:\Users\Admin\Desktop\School Work\Teachers Photos"
files = [f for f in os.listdir(photos_dir) if f.endswith('.jpg') or f.endswith('.png')]

for file in files:
    full_name = os.path.splitext(file)[0]
    file_path = os.path.join(photos_dir, file)
    print(f"Processing {full_name}...")
    
    with open(file_path, "rb") as f:
        image_data = f.read()
    
    base64_data = "data:image/jpeg;base64," + base64.b64encode(image_data).decode('utf-8')
    
    boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
    body = b'--' + boundary.encode() + b'\r\n'
    body += b'Content-Disposition: form-data; name="file"; filename="photo.jpg"\r\n'
    body += b'Content-Type: image/jpeg\r\n\r\n'
    body += image_data
    body += b'\r\n--' + boundary.encode() + b'--\r\n'
    
    try:
        req = urllib.request.Request('http://127.0.0.1:8000/extract', data=body)
        req.add_header('Content-Type', f'multipart/form-data; boundary={boundary}')
        req.add_header('Content-Length', str(len(body)))
        
        with urllib.request.urlopen(req) as response:
            if response.status != 200:
                print(f"HTTP Error for {full_name}: {response.status}")
                continue
            
            data = json.loads(response.read().decode('utf-8'))
            if data.get('faces') and len(data['faces']) > 0:
                embedding = data['faces'][0]['embedding']
                
                # Role logic
                phone = ""
                role = "Teacher"
                dept = "Staff"
                if full_name == "Rizwan":
                    phone = "9470109644"
                    role = "Administrator"
                    dept = "Management"
                elif full_name == "Raju Gupta":
                    phone = "9546477994"
                    role = "Administrator"
                    dept = "Management"
                
                # Insert/Update Teacher
                cursor.execute("SELECT id FROM teachers WHERE fullName = ?", (full_name,))
                teacher = cursor.fetchone()
                if teacher:
                    cursor.execute("UPDATE teachers SET photo = ?, phone = ? WHERE id = ?", (base64_data, phone, teacher[0]))
                else:
                    cursor.execute("INSERT INTO teachers (fullName, department, phone, photo) VALUES (?, ?, ?, ?)", (full_name, dept, phone, base64_data))
                
                # Insert/Update faceEmbedding
                cursor.execute("DELETE FROM faceEmbeddings WHERE targetType='teachers' AND name=?", (full_name,))
                cursor.execute("""
                    INSERT INTO faceEmbeddings (targetType, name, tag, descriptorJson)
                    VALUES ('teachers', ?, 'teacher', ?)
                """, (full_name, json.dumps(embedding)))
                
                # Insert/Update Users for owners
                if role == "Administrator":
                    username = full_name.replace(" ", "").lower()
                    cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
                    user = cursor.fetchone()
                    if user:
                        cursor.execute("UPDATE users SET role = ?, password = ? WHERE id = ?", (role, "admin123", user[0]))
                    else:
                        cursor.execute("INSERT INTO users (username, fullName, role, password, status) VALUES (?, ?, ?, ?, ?)", (username, full_name, role, "admin123", "Active"))
                    print(f"Added {full_name} as Administrator (Username: {username}, Password: admin123)")
                
                print(f"Enrolled {full_name} successfully.")
            else:
                print(f"No face detected in photo for {full_name}")
    except Exception as e:
        print(f"Error processing {full_name}: {e}")

conn.commit()
conn.close()
print("Finished enrolling teachers!")
