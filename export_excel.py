import sqlite3
import xlsxwriter
import base64
import io
from PIL import Image

db_path = r"C:\Users\Admin\AppData\Roaming\school-management-system\school.db"
export_path = r"C:\Users\Admin\Desktop\School Work\Student_Data_Final.xlsx"

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get the columns we want (added DOB)
columns = ["Photo", "Full Name", "Class", "Roll No", "Admission No", "DOB", "Phone", "Father's Name"]
cursor.execute("SELECT photo, fullName, className, rollNo, admissionNo, dob, phone, fatherName FROM students ORDER BY className, fullName")
students = cursor.fetchall()

workbook = xlsxwriter.Workbook(export_path)
worksheet = workbook.add_worksheet("Students")

# Formats
header_format = workbook.add_format({
    'bold': True, 'font_size': 24, 'align': 'center', 'valign': 'vcenter',
    'bg_color': '#2F5496', 'font_color': '#FFFFFF', 'border': 2,
    'border_color': '#1F3864'
})
data_format = workbook.add_format({
    'font_size': 20, 'align': 'center', 'valign': 'vcenter',
    'border': 1, 'text_wrap': True
})
photo_format = workbook.add_format({
    'align': 'center', 'valign': 'vcenter', 'border': 1
})

# Set column widths
worksheet.set_column('A:A', 40)  # Photo column
worksheet.set_column('B:B', 40)  # Full Name
worksheet.set_column('C:C', 18)  # Class
worksheet.set_column('D:D', 14)  # Roll No
worksheet.set_column('E:E', 22)  # Admission No
worksheet.set_column('F:F', 22)  # DOB
worksheet.set_column('G:G', 22)  # Phone
worksheet.set_column('H:H', 35)  # Father's Name

# Write headers
worksheet.set_row(0, 50)
for col_num, col_name in enumerate(columns):
    worksheet.write(0, col_num, col_name, header_format)

# Add auto-filter on ALL columns (for class filter + search)
worksheet.autofilter(0, 0, len(students), len(columns) - 1)

# Freeze the header row so it stays visible while scrolling
worksheet.freeze_panes(1, 0)

row_idx = 1
for student in students:
    photo_b64, full_name, class_name, roll_no, admission_no, dob, phone, father_name = student
    
    # Max row height in Excel = 409.5 points
    worksheet.set_row(row_idx, 409.5)
    
    # Write photo placeholder with border
    worksheet.write_blank(row_idx, 0, None, photo_format)
    
    # Insert photo
    if photo_b64 and photo_b64.startswith("data:image"):
        try:
            header, encoded = photo_b64.split(",", 1)
            ext = ".png" if "image/png" in header else ".jpg"
            image_data = base64.b64decode(encoded)
            
            # Open image to get dimensions
            img = Image.open(io.BytesIO(image_data))
            orig_w, orig_h = img.size
            
            # Scale to fit row height (409.5pt * 1.33 = ~545px)
            target_h = 535
            scale = target_h / orig_h
            target_w = int(orig_w * scale)
            
            # Resize to fit
            img = img.resize((target_w, target_h), Image.Resampling.LANCZOS)
            
            # Convert RGBA to RGB if needed
            if img.mode in ('RGBA', 'LA'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                background.paste(img, mask=img.split()[3])
                img = background
            
            resized_stream = io.BytesIO()
            img.save(resized_stream, format="PNG" if ext == ".png" else "JPEG", quality=95)
            resized_stream.seek(0)
            
            # Center the image
            cell_w_px = 40 * 7.5
            x_offset = max(2, int((cell_w_px - target_w) / 2))
            
            worksheet.insert_image(row_idx, 0, f"photo{row_idx}{ext}", 
                                   {'image_data': resized_stream, 
                                    'object_position': 1,
                                    'x_offset': x_offset,
                                    'y_offset': 5})
        except Exception as e:
            pass
    
    # Write data
    worksheet.write(row_idx, 1, full_name or "", data_format)
    worksheet.write(row_idx, 2, class_name or "", data_format)
    worksheet.write(row_idx, 3, roll_no or "", data_format)
    worksheet.write(row_idx, 4, admission_no or "", data_format)
    worksheet.write(row_idx, 5, dob or "", data_format)
    worksheet.write(row_idx, 6, phone or "", data_format)
    worksheet.write(row_idx, 7, father_name or "", data_format)
    
    row_idx += 1

workbook.close()
conn.close()
print(f"Exported {len(students)} students to {export_path}")
print("Features: Auto-filter on all columns (click dropdown arrow on Class to filter)")
print("Search: Use Ctrl+F to search by name")
