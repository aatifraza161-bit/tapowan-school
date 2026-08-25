import os
import sqlite3
import base64

db_path = r"C:\Users\Admin\AppData\Roaming\school-management-system\school.db"
photos_dir = r"C:\Users\Admin\Desktop\School Work\Students Photo"

def main():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    files = os.listdir(photos_dir)
    updated_students = []
    not_found = []
    multiple_found = []

    for file in files:
        if file.startswith("file_") or file == "v.png":
            continue

        name_to_match = os.path.splitext(file)[0].strip()
        if not name_to_match:
            continue

        # Search for student in database (case-insensitive)
        query_name = f"%{name_to_match}%"
        cursor.execute("SELECT id, fullName FROM students WHERE fullName LIKE ?", (query_name,))
        rows = cursor.fetchall()

        if len(rows) == 1:
            student_id, student_name = rows[0]
            file_path = os.path.join(photos_dir, file)
            
            with open(file_path, "rb") as image_file:
                encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
            
            ext = os.path.splitext(file)[1].lower()
            mime_type = "image/png" if ext == ".png" else "image/jpeg"
            data_url = f"data:{mime_type};base64,{encoded_string}"

            cursor.execute("UPDATE students SET photo = ? WHERE id = ?", (data_url, student_id))
            updated_students.append(f"{student_name} (Matched with {file})")
        elif len(rows) == 0:
            not_found.append(name_to_match)
        else:
            multiple_found.append(name_to_match)

    conn.commit()
    conn.close()

    print("=== SUCCESSFULLY ADDED ===")
    for s in updated_students:
        print(f"- {s}")
    
    print("\n=== NOT FOUND IN DATABASE ===")
    for s in not_found:
        print(f"- {s}")
    
    print("\n=== MULTIPLE MATCHES (Skipped) ===")
    for s in multiple_found:
        print(f"- {s}")

if __name__ == "__main__":
    main()
