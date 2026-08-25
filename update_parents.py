import json
import sqlite3
import os

excel_file = "excel_parents.json"
with open(excel_file, 'r', encoding='utf-8') as f:
    excel_students = json.load(f)

db_path = os.path.join(os.path.expanduser('~'), 'AppData', 'Roaming', 'school-management-system', 'school.db')
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("SELECT value FROM modules WHERE key = 'students'")
row = cursor.fetchone()
if not row:
    print("No students module found in the DB.")
    exit(1)

students = json.loads(row[0])

def is_invalid(name):
    if not name:
        return True
    lower = str(name).lower().strip()
    return lower in ['00', '000', 'nil', '0', 'na', 'n/a']

updated_count = 0

for s in students:
    full_name = s.get('fullName')
    if not full_name:
        continue
    
    needs_update = False
    if is_invalid(s.get('fatherName')): needs_update = True
    if is_invalid(s.get('motherName')): needs_update = True
    if 'parentName' in s and is_invalid(s.get('parentName')): needs_update = True

    if needs_update:
        s_name = full_name.upper().strip()
        if s_name in excel_students:
            match = excel_students[s_name]
            old_f = s.get('fatherName', '')
            old_m = s.get('motherName', '')
            
            did_update = False
            if is_invalid(old_f) and match['father'] and not is_invalid(match['father']):
                s['fatherName'] = match['father']
                did_update = True
            
            if is_invalid(old_m) and match['mother'] and not is_invalid(match['mother']):
                s['motherName'] = match['mother']
                did_update = True
                
            if 'parentName' in s and is_invalid(s.get('parentName')) and match['father'] and not is_invalid(match['father']):
                s['parentName'] = match['father']
                did_update = True
                
            if did_update:
                print(f"Updated {full_name}: Father({old_f} -> {s.get('fatherName')}), Mother({old_m} -> {s.get('motherName')})")
                updated_count += 1
        else:
            pass # Name not found in excel

if updated_count > 0:
    cursor.execute("UPDATE modules SET value = ? WHERE key = 'students'", (json.dumps(students),))
    conn.commit()
    print(f"Successfully updated {updated_count} students in the database.")
else:
    print("No students needed updating or no matches found.")

conn.close()
