import os
import sqlite3
import base64

db_path = r"C:\Users\Admin\AppData\Roaming\school-management-system\school.db"
photos_dir = r"C:\Users\Admin\Desktop\School Work\Students Photo"

mapping = {
    "Atif": "VII",
    "aRYAN": "VI",
    "dEEPAK": "III",
    "Ayan": "VII",
    "Anjal": "VI",
    "anjal": "VI",
    "Geeta": "X",
    "Rehan": "IV",
    "Sapna": "X",
    "Tatheera": "X"
}

def main():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    files = os.listdir(photos_dir)
    updated = []

    for file in files:
        base_name = os.path.splitext(file)[0].strip()
        
        if base_name in mapping:
            class_prefix = mapping[base_name]
            # Match class with % since they usually have "-A" (e.g. VII-A)
            class_like = f"{class_prefix}-%"
            
            query_name = f"%{base_name}%"
            cursor.execute("SELECT id, fullName, className FROM students WHERE fullName LIKE ? AND className LIKE ?", (query_name, class_like))
            rows = cursor.fetchall()

            if len(rows) == 1:
                student_id, student_name, student_class = rows[0]
                file_path = os.path.join(photos_dir, file)
                
                with open(file_path, "rb") as image_file:
                    encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
                
                ext = os.path.splitext(file)[1].lower()
                mime_type = "image/png" if ext == ".png" else "image/jpeg"
                data_url = f"data:{mime_type};base64,{encoded_string}"

                cursor.execute("UPDATE students SET photo = ? WHERE id = ?", (data_url, student_id))
                updated.append(f"{student_name} ({student_class}) - Matched with {file}")
            else:
                print(f"Skipping {file}: Found {len(rows)} matches for name '{base_name}' in class '{class_prefix}'")

    conn.commit()
    conn.close()

    print("\n=== SUCCESSFULLY RESOLVED & ADDED ===")
    for u in updated:
        print("- " + u)

if __name__ == "__main__":
    main()
