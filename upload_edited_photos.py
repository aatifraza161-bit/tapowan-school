import os
import sqlite3
import base64

db_path = r"C:\Users\Admin\AppData\Roaming\school-management-system\school.db"
base_photos_dir = r"C:\Users\Admin\Desktop\School Work\Photos"
folders = ["Class 1 copy", "L.K.G COPY", "Nursery Copy", "UKG COPY"]

def main():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    updated_students = []
    not_found = []
    multiple_found = []
    errors = []

    folder_pairs = [
        ("Class 1", "I-A"),
        ("Class 2", "II-A"),
        ("L.K.G", "LKG-A"),
        ("Nursery", "Nursery-A"),
        ("UKG", "UKG-A")
    ]

    for orig_folder, db_class_name in folder_pairs:
        orig_path = os.path.join(base_photos_dir, orig_folder)
        
        if not os.path.exists(orig_path):
            print(f"Skipping {orig_folder}, does not exist.")
            continue
            
        print(f"\nProcessing ORIGINAL {orig_folder}...")
        files = os.listdir(orig_path)
        
        for file in files:
            if file.startswith("file_") or file == "v.png" or not file.lower().endswith(('.png', '.jpg', '.jpeg')):
                continue

            name_to_match = os.path.splitext(file)[0].strip().replace(" ✓", "").lower()
            if not name_to_match:
                continue

            # First, try an exact/LIKE match
            query_name = f"%{name_to_match}%"
            cursor.execute("SELECT id, fullName FROM students WHERE fullName LIKE ? AND className = ?", (query_name, db_class_name))
            rows = cursor.fetchall()
            
            # If no match or multiple matches, try normalizing variations
            if len(rows) != 1:
                import re
                
                def normalize_name(name):
                    n = name.lower()
                    # Variations of Perween
                    n = re.sub(r'\b(perween|praween|parween|perveen|pravin|parveen)\b', 'perween', n)
                    # Variations of Kumar/Kumari
                    n = re.sub(r'\b(kuma|kumr|kr)\b', 'kumar', n)
                    n = re.sub(r'\b(kumri|kmri)\b', 'kumari', n)
                    # Remove special chars and extra spaces
                    n = re.sub(r'[^a-z0-9\s]', '', n)
                    return ' '.join(n.split())

                norm_search = normalize_name(name_to_match)
                
                # Fetch all students in this class
                cursor.execute("SELECT id, fullName FROM students WHERE className = ?", (db_class_name,))
                all_students = cursor.fetchall()
                
                fuzzy_matches = []
                for sid, sname in all_students:
                    if sname:
                        norm_db = normalize_name(sname)
                        if norm_search in norm_db or norm_db in norm_search:
                            fuzzy_matches.append((sid, sname))
                            
                # Replace the original rows with our fuzzy matches
                rows = fuzzy_matches

            if len(rows) == 1:
                student_id, student_name = rows[0]
                
                file_path = os.path.join(orig_path, file)
                
                try:
                    with open(file_path, "rb") as image_file:
                        encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
                    
                    ext = os.path.splitext(file_path)[1].lower()
                    mime_type = "image/png" if ext == ".png" else "image/jpeg"
                    data_url = f"data:{mime_type};base64,{encoded_string}"

                    cursor.execute("UPDATE students SET photo = ? WHERE id = ?", (data_url, student_id))
                    
                    # Rename the file on disk to include a tick if it doesn't have one
                    new_file = file
                    if " ✓" not in file:
                        base_name = os.path.splitext(file)[0]
                        orig_ext = os.path.splitext(file)[1]
                        new_file = f"{base_name} ✓{orig_ext}"
                        new_file_path = os.path.join(orig_path, new_file)
                        os.rename(file_path, new_file_path)

                    updated_students.append(f"[{orig_folder}] {student_name} (Matched with {new_file})")
                except Exception as e:
                    errors.append(f"Failed to process {file}: {str(e)}")
            elif len(rows) == 0:
                not_found.append(f"[{orig_folder}] {name_to_match}")
            else:
                multiple_found.append(f"[{orig_folder}] {name_to_match} ({len(rows)} matches found)")

    conn.commit()
    conn.close()

    print("\n=== SUCCESSFULLY ADDED ===")
    for s in updated_students:
        print(f"- {s}")
    
    print("\n=== NOT FOUND IN DATABASE ===")
    for s in not_found:
        print(f"- {s}")
    
    print("\n=== MULTIPLE MATCHES (Skipped) ===")
    for s in multiple_found:
        print(f"- {s}")
        
    if errors:
        print("\n=== ERRORS ===")
        for e in errors:
            print(f"- {e}")

if __name__ == "__main__":
    main()
