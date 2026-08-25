import sqlite3
import xlsxwriter

db_path = r"C:\Users\Admin\AppData\Roaming\school-management-system\school.db"
export_path = r"C:\Users\Admin\Desktop\School Work\Students_Without_Photo.xlsx"

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("SELECT fullName, className, rollNo, admissionNo, dob, phone, fatherName FROM students WHERE photo IS NULL OR photo = '' ORDER BY className, fullName")
students = cursor.fetchall()

wb = xlsxwriter.Workbook(export_path)
ws = wb.add_worksheet('No Photo')

hdr = wb.add_format({
    'bold': True, 'font_size': 22, 'align': 'center', 'valign': 'vcenter',
    'bg_color': '#C00000', 'font_color': '#FFFFFF', 'border': 2
})
data = wb.add_format({
    'font_size': 18, 'align': 'center', 'valign': 'vcenter', 'border': 1, 'text_wrap': True
})

cols = ['S.No', 'Full Name', 'Class', 'Roll No', 'Admission No', 'DOB', 'Phone', 'Father Name']
widths = [10, 40, 18, 14, 22, 22, 22, 35]

for i, w in enumerate(widths):
    ws.set_column(i, i, w)

ws.set_row(0, 45)
for i, c in enumerate(cols):
    ws.write(0, i, c, hdr)

ws.autofilter(0, 0, len(students), len(cols) - 1)
ws.freeze_panes(1, 0)

for idx, s in enumerate(students):
    ws.set_row(idx + 1, 35)
    ws.write(idx + 1, 0, idx + 1, data)
    for j, val in enumerate(s):
        ws.write(idx + 1, j + 1, val or '', data)

wb.close()
conn.close()

print(f"Exported successfully to {export_path}")
print(f"Total students without photo: {len(students)}")
