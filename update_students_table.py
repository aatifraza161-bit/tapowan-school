import json
import sqlite3
import os

excel_file = "excel_parents.json"
with open(excel_file, 'r', encoding='utf-8') as f:
    excel_students = json.load(f)

db_path = os.path.join(os.path.expanduser('~'), 'AppData', 'Roaming', 'school-management-system', 'school.db')
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

def is_invalid(name):
    if not name:
        return True
    lower = str(name).lower().strip()
    return lower in ['00', '000', 'nil', '0', 'na', 'n/a']

cursor.execute("SELECT id, fullName, fatherName, motherName, parentName FROM students")
students = cursor.fetchall()

updated_count = 0

for row in students:
    s_id, full_name, father_name, mother_name, parent_name = row
    if not full_name:
        continue
        
    needs_update = False
    if is_invalid(father_name): needs_update = True
    if is_invalid(mother_name): needs_update = True
    if is_invalid(parent_name): needs_update = True

    if needs_update:
        s_name = str(full_name).upper().strip()
        if s_name in excel_students:
            match = excel_students[s_name]
            
            did_update = False
            new_f = father_name
            new_m = mother_name
            new_p = parent_name
            
            if is_invalid(father_name) and match['father'] and not is_invalid(match['father']):
                new_f = match['father']
                did_update = True
            
            if is_invalid(mother_name) and match['mother'] and not is_invalid(match['mother']):
                new_m = match['mother']
                did_update = True
                
            if is_invalid(parent_name) and match['father'] and not is_invalid(match['father']):
                new_p = match['father']
                did_update = True
                
            if did_update:
                cursor.execute(
                    "UPDATE students SET fatherName = ?, motherName = ?, parentName = ? WHERE id = ?",
                    (new_f, new_m, new_p, s_id)
                )
                print(f"Updated {full_name}: Father({father_name} -> {new_f}), Mother({mother_name} -> {new_m})")
                updated_count += 1
        else:
            pass

if updated_count > 0:
    conn.commit()
    print(f"\nSuccessfully updated {updated_count} students in the database.")
else:
    print("No students needed updating or no matches found.")

conn.close()
