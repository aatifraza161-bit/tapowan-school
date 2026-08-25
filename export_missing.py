import sqlite3
import os
import json

db_path = os.path.join(os.path.expanduser('~'), 'AppData', 'Roaming', 'school-management-system', 'school.db')
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

def is_invalid(name):
    if not name:
        return False
    lower = str(name).lower().strip()
    return lower in ['0', '00', '000', '0000', 'nil', 'na', 'n/a', '00000']

cursor.execute("SELECT id, fullName, fatherName, motherName, parentName, className, rollNo FROM students")
students = cursor.fetchall()

missing = []

for row in students:
    s_id, full_name, father_name, mother_name, parent_name, class_name, roll_no = row
    
    if is_invalid(father_name) or is_invalid(mother_name) or is_invalid(parent_name):
        missing.append({
            "Student Name": full_name,
            "Class": class_name,
            "Roll No": roll_no,
            "Father Name": father_name,
            "Mother Name": mother_name
        })

with open('missing_parents.json', 'w', encoding='utf-8') as f:
    json.dump(missing, f, indent=2)

print(f"Exported {len(missing)} missing students to JSON.")
conn.close()
