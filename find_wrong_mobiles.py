import sqlite3
import os
import csv
import re

db_path = os.path.join(os.path.expanduser('~'), 'AppData', 'Roaming', 'school-management-system', 'school.db')
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Query fullName, className, rollNo, phone
cursor.execute("SELECT fullName, className, rollNo, phone FROM students")
students = cursor.fetchall()

def is_wrong_mobile(phone):
    if not phone:
        return False # Let's ignore completely empty ones unless they want those too. The prompt implies filled but wrong numbers.
    
    # Strip any spaces
    cleaned = str(phone).strip()
    
    # Remove +91 or 91 if it's exactly 12 or 13 digits, but let's just count digits
    digits_only = re.sub(r'\D', '', cleaned)
    
    if len(digits_only) == 0:
        return True # It has letters or is gibberish
        
    if len(digits_only) != 10:
        return True # Not 10 digits (9, 11, etc.)
        
    # Check if all digits are the same (e.g. 9999999999, 0000000000)
    if len(set(digits_only)) == 1:
        return True
        
    return False

out_path = r"C:\Users\Admin\Desktop\School Work\Apaar data\Wrong_Mobile_Numbers.csv"
with open(out_path, 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(['Name', 'Class', 'Roll No.', 'Wrong Mobile No.'])
    
    count = 0
    for row in students:
        full_name, class_name, roll_no, phone = row
        if is_wrong_mobile(phone):
            writer.writerow([full_name, class_name, roll_no, phone])
            count += 1

print(f"Successfully found {count} wrong mobile numbers.")
print(f"Exported to: {out_path}")

conn.close()
