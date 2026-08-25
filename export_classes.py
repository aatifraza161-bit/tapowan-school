import sqlite3
import csv
import os
import re

db_path = os.path.join(os.path.expanduser('~'), 'AppData', 'Roaming', 'school-management-system', 'school.db')
export_dir = r"C:\Users\Admin\Desktop\School Work\Student Data"

if not os.path.exists(export_dir):
    os.makedirs(export_dir)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("SELECT DISTINCT className FROM students WHERE className IS NOT NULL AND className != ''")
classes = [row[0] for row in cursor.fetchall()]

def clean_filename(name):
    return re.sub(r'[\\/*?:"<>|]', "_", name).strip()

exported_count = 0

for class_name in classes:
    cursor.execute("SELECT * FROM students WHERE className = ?", (class_name,))
    students = cursor.fetchall()
    
    if not students:
        continue
        
    col_names = [description[0] for description in cursor.description]
    
    safe_name = clean_filename(class_name)
    file_path = os.path.join(export_dir, f"{safe_name}.csv")
    
    with open(file_path, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow(col_names)
        
        for student in students:
            row = list(student)
            
            for i, val in enumerate(row):
                if val is None:
                    row[i] = ""
                    continue
                
                val_str = str(val)
                
                # Fix photo column (hide massive base64 strings)
                if col_names[i] == 'photo':
                    if val_str.startswith('data:image'):
                        row[i] = 'Available'
                    elif val_str.strip():
                        row[i] = 'Available'
                    else:
                        row[i] = 'Not Available'
                        
                # Fix phone/aadhar columns to prevent Excel scientific notation
                elif col_names[i] in ['phone', 'phone1', 'phone2', 'whatsapp', 'aadhar', 'fatherAadhar', 'motherAadhar', 'admissionNo', 'rollNo']:
                    if val_str.strip():
                        # Wrap in Excel text formula
                        row[i] = f'="{val_str.strip()}"'
                        
            writer.writerow(row)
            
    print(f"Exported {len(students)} students to {safe_name}.csv")
    exported_count += 1

conn.close()
print(f"\nSuccessfully generated {exported_count} class files in: {export_dir}")
