import os
import sqlite3
import base64

db_path = r"C:\Users\Admin\AppData\Roaming\school-management-system\school.db"
photos_dir = r"C:\Users\Admin\Desktop\School Work\Students Photo"

targets = {
    "Geeta.png": [2515, 2653],
    "Sapna.png": [2509, 2649],
    "Tatheera.png": [2504, 2648]
}

def main():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    updated = []

    for filename, ids in targets.items():
        file_path = os.path.join(photos_dir, filename)
        if not os.path.exists(file_path):
            continue

        with open(file_path, "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
        
        ext = os.path.splitext(filename)[1].lower()
        mime_type = "image/png" if ext == ".png" else "image/jpeg"
        data_url = f"data:{mime_type};base64,{encoded_string}"

        for student_id in ids:
            cursor.execute("UPDATE students SET photo = ? WHERE id = ?", (data_url, student_id))
        
        updated.append(f"{filename} applied to duplicate records {ids}")

    conn.commit()
    conn.close()

    print("\n=== DUPLICATES RESOLVED ===")
    for u in updated:
        print("- " + u)

if __name__ == "__main__":
    main()
