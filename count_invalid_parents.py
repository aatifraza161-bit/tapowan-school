import sqlite3
import os

db_path = os.path.join(os.path.expanduser('~'), 'AppData', 'Roaming', 'school-management-system', 'school.db')
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

def is_invalid(name):
    if not name:
        return False # Only counting explicitly wrong ones like "0", "00", "nil"
    lower = str(name).lower().strip()
    return lower in ['0', '00', '000', '0000', 'nil', 'na', 'n/a', '00000']

cursor.execute("SELECT id, fullName, fatherName, motherName, parentName FROM students")
students = cursor.fetchall()

invalid_count = 0
invalid_students = []

for row in students:
    s_id, full_name, father_name, mother_name, parent_name = row
    
    if is_invalid(father_name) or is_invalid(mother_name) or is_invalid(parent_name):
        invalid_count += 1
        invalid_students.append(f"{full_name} (Father: {father_name}, Mother: {mother_name}, Parent: {parent_name})")

print(f"Total students still with invalid parent names: {invalid_count}")
if invalid_count > 0:
    print("Sample of remaining:")
    for s in invalid_students[:10]:
        print(f" - {s}")

conn.close()
