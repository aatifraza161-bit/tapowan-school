import sqlite3
import os

db_path = os.path.join(os.path.expanduser('~'), 'AppData', 'Roaming', 'school-management-system', 'school.db')
conn = sqlite3.connect(db_path)
print("Students Schema:", conn.execute("PRAGMA table_info(students)").fetchall())

# print some students
print(conn.execute("SELECT id, fullName, fatherName, motherName FROM students LIMIT 5").fetchall())
conn.close()
