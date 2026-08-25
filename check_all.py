import sqlite3
from collections import defaultdict

conn = sqlite3.connect(r'C:\Users\Admin\AppData\Roaming\school-management-system\school.db')
cursor = conn.cursor()

print("--- 1. Checking for students with MULTIPLE ACTIVE profiles ---")
students = cursor.execute("SELECT admissionNo, fullName, className, status FROM students WHERE status = 'Active'").fetchall()
adm_groups = defaultdict(list)
for s in students:
    adm_groups[s[0]].append(s)

multiple_active = {adm: profiles for adm, profiles in adm_groups.items() if len(profiles) > 1}
for adm, profiles in multiple_active.items():
    print(f"AdmissionNo: {adm}")
    for p in profiles:
        print(f"  - {p}")


print("\n--- 2. Checking for students with DUPLICATE dues (lowercase vs uppercase) ---")
# Find all dues that start with lowercase 'Tuition fee of' or 'Late fee of'
all_dues = cursor.execute("SELECT id, admissionNo, studentName, particulars, dueAmount FROM dueManagement WHERE particulars LIKE 'Tuition fee of%' OR particulars LIKE 'Late fee of%'").fetchall()

lowercase_dues = [d for d in all_dues if (d[3] or '').startswith('Tuition fee of') or (d[3] or '').startswith('Late fee of')]

print(f"Found {len(lowercase_dues)} old lowercase dues.")
# Group them to see how many
lower_due_counts = defaultdict(int)
for d in lowercase_dues:
    lower_due_counts[d[1]] += 1

print("Students with lowercase dues:")
for adm, count in lower_due_counts.items():
    name = next(d[2] for d in lowercase_dues if d[1] == adm)
    print(f"  - {adm} ({name}): {count} lowercase dues")


