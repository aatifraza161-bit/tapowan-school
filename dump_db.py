import sqlite3
import json
import os

db_path = r"C:\Users\Admin\AppData\Roaming\school-management-system\school.db"
out_path = r"C:\Users\Admin\Desktop\My Project\Slip & Receipt\All fixed\TapowanPublicSchool-fixed\students_dump.json"

def main():
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # The requested columns:
    # Photo, Roll No., Full Name, Class, Admission No., Gender, Date of Birth, Father Name, Mother Name, Phone, Address
    cursor.execute("""
        SELECT photo, rollNo, fullName, className, admissionNo, gender, dob, fatherName, motherName, phone, address
        FROM students
    """)
    rows = cursor.fetchall()
    
    data = []
    for row in rows:
        data.append({
            "photo": row["photo"] or "",
            "rollNo": row["rollNo"] or "",
            "fullName": row["fullName"] or "",
            "className": row["className"] or "",
            "admissionNo": row["admissionNo"] or "",
            "gender": row["gender"] or "",
            "dob": row["dob"] or "",
            "fatherName": row["fatherName"] or "",
            "motherName": row["motherName"] or "",
            "phone": row["phone"] or "",
            "address": row["address"] or ""
        })

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(data, f)
        
    print(f"Dumped {len(data)} students to JSON")

if __name__ == "__main__":
    main()
