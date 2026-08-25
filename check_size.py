import sqlite3, base64, io
from PIL import Image

conn = sqlite3.connect(r"C:\Users\Admin\AppData\Roaming\school-management-system\school.db")
cursor = conn.cursor()
cursor.execute("SELECT fullName, photo FROM students WHERE photo IS NOT NULL AND photo != '' LIMIT 5")
rows = cursor.fetchall()
for name, photo in rows:
    if photo and photo.startswith("data:"):
        header, encoded = photo.split(",", 1)
        img = Image.open(io.BytesIO(base64.b64decode(encoded)))
        print(f"{name}: {img.size[0]}x{img.size[1]} pixels")
