import sqlite3

conn = sqlite3.connect(r'C:\Users\Admin\AppData\Roaming\school-management-system\school.db')
cursor = conn.cursor()

# Get all dues that might match (case-insensitive in SQLite)
all_dues = cursor.execute("SELECT id, particulars FROM dueManagement WHERE particulars LIKE 'Tuition fee of%' OR particulars LIKE 'Late fee of%'").fetchall()

# Filter ONLY the exact lowercase ones
ids_to_delete = []
for d in all_dues:
    particulars = d[1] or ''
    if particulars.startswith('Tuition fee of') or particulars.startswith('Late fee of'):
        ids_to_delete.append(d[0])

if ids_to_delete:
    print(f"Deleting {len(ids_to_delete)} duplicate lowercase dues across the whole school...")
    # Delete them in batches or one query
    placeholders = ','.join('?' for _ in ids_to_delete)
    cursor.execute(f"DELETE FROM dueManagement WHERE id IN ({placeholders})", ids_to_delete)
    conn.commit()
    print("Cleanup successful!")
else:
    print("No lowercase dues found.")
