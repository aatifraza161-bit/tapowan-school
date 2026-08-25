import sqlite3

db_path = r"C:\Users\Admin\AppData\Roaming\school-management-system\school.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

names = ["Geeta", "Sapna", "Tatheera", "Anjal", "Aryan", "Ayan"]
for n in names:
    cursor.execute(f"SELECT id, fullName, className, fatherName FROM students WHERE fullName LIKE '%{n}%' COLLATE NOCASE")
    print(f"--- Matches for {n} ---")
    for row in cursor.fetchall():
        print(row)

conn.close()
