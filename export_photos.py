import sqlite3
import csv
import os

db_path = os.path.join(os.path.expanduser('~'), 'AppData', 'Roaming', 'school-management-system', 'school.db')
desktop_path = os.path.join(os.path.expanduser('~'), 'Desktop', 'Students_With_Photos.csv')

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("SELECT admissionNo, rollNo, fullName, className, phone, fatherName, motherName FROM students WHERE photo IS NOT NULL AND photo != ''")
students = cursor.fetchall()

with open(desktop_path, mode='w', newline='', encoding='utf-8') as file:
    writer = csv.writer(file)
    writer.writerow(['Admission No', 'Roll No', 'Name', 'Class', 'Father Name', 'Mother Name', 'Phone', 'Has Profile Photo'])
    
    for student in students:
        row = list(student)
        row.append('Yes')
        writer.writerow(row)

print(f"Successfully exported {len(students)} students to {desktop_path}")
conn.close()
