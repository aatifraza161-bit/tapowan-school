import sqlite3

conn = sqlite3.connect(r'C:\Users\Admin\AppData\Roaming\school-management-system\school.db')
cursor = conn.cursor()

# 1. Restore Dristy's I-A status to Active
cursor.execute("UPDATE students SET status = 'Active' WHERE admissionNo = '584/24' AND className = 'I-A'")

# 2. Fix Anshu Sharma lowercase duplicates
anshu_dues = cursor.execute("SELECT id, particulars FROM dueManagement WHERE admissionNo = '033'").fetchall()
for d in anshu_dues:
    if d[1].startswith('Tuition fee of'): # lowercase f
        cursor.execute(f"DELETE FROM dueManagement WHERE id = {d[0]}")

# 3. Fix Dristy Kumari lowercase duplicates
dristy_dues = cursor.execute("SELECT id, particulars FROM dueManagement WHERE admissionNo = '584/24'").fetchall()
for d in dristy_dues:
    if d[1].startswith('Tuition fee of'): # lowercase f
        cursor.execute(f"DELETE FROM dueManagement WHERE id = {d[0]}")

conn.commit()

print("Database fixed successfully!")
print("Anshu Sharma remaining dues:", conn.execute("SELECT particulars FROM dueManagement WHERE admissionNo = '033'").fetchall())
print("Dristy Kumari status:", conn.execute("SELECT className, status FROM students WHERE admissionNo = '584/24'").fetchall())

