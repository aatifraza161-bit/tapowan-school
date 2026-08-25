const fs = require('fs');
const ExcelJS = require('exceljs');
const sizeOf = require('image-size').imageSize;

const dataFile = './students_dump.json';
const outputFile = 'C:/Users/Admin/Desktop/Students_List_v7.xlsx';

async function main() {
    const rawData = fs.readFileSync(dataFile, 'utf8');
    const students = JSON.parse(rawData);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Students');

    // We want a uniform, large row height for everything
    const ROW_HEIGHT_POINTS = 200; // About 266 pixels tall
    const MAX_IMG_HEIGHT_PX = 260; // Slightly smaller to fit inside the cell without overflowing
    const FONT_SIZE = 16; // Much larger text to match the large rows

    // Define columns
    sheet.columns = [
        { header: '📷 Photo', key: 'photo', width: 30 },
        { header: 'Roll No.', key: 'rollNo', width: 15 },
        { header: 'Full Name', key: 'fullName', width: 35 },
        { header: 'Class', key: 'className', width: 20 },
        { header: 'Admission No.', key: 'admissionNo', width: 20 },
        { header: 'Gender', key: 'gender', width: 15 },
        { header: 'Date of Birth', key: 'dob', width: 20 },
        { header: 'Father Name', key: 'fatherName', width: 35 },
        { header: 'Mother Name', key: 'motherName', width: 35 },
        { header: 'Phone', key: 'phone', width: 25 },
        { header: 'Address', key: 'address', width: 45 }
    ];

    sheet.getRow(1).font = { bold: true, size: 18 };
    sheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.getRow(1).height = 40;

    let maxScaledWidth = 50;

    students.forEach((student, index) => {
        const rowIndex = index + 2; 
        
        const row = sheet.getRow(rowIndex);
        row.height = ROW_HEIGHT_POINTS;
        row.font = { size: FONT_SIZE };
        row.alignment = { vertical: 'middle', wrapText: true };
        
        sheet.getCell(`B${rowIndex}`).value = student.rollNo;
        sheet.getCell(`C${rowIndex}`).value = student.fullName;
        sheet.getCell(`D${rowIndex}`).value = student.className;
        sheet.getCell(`E${rowIndex}`).value = student.admissionNo;
        sheet.getCell(`F${rowIndex}`).value = student.gender;
        sheet.getCell(`G${rowIndex}`).value = student.dob;
        sheet.getCell(`H${rowIndex}`).value = student.fatherName;
        sheet.getCell(`I${rowIndex}`).value = student.motherName;
        sheet.getCell(`J${rowIndex}`).value = student.phone;
        sheet.getCell(`K${rowIndex}`).value = student.address;

        const photoDataUrl = student.photo;
        if (photoDataUrl && photoDataUrl.startsWith('data:image')) {
            try {
                const match = photoDataUrl.match(/^data:image\/(png|jpeg|jpg);base64,(.+)$/);
                if (match && match[2]) {
                    const ext = match[1] === 'jpeg' ? 'jpeg' : 'png';
                    const base64Str = match[2];
                    const buffer = Buffer.from(base64Str, 'base64');
                    
                    const dimensions = sizeOf(buffer);
                    const imgWidth = dimensions.width;
                    const imgHeight = dimensions.height;
                    
                    // Scale image down to fit the cell perfectly without overflowing
                    let renderWidth = imgWidth;
                    let renderHeight = imgHeight;
                    
                    if (renderHeight > MAX_IMG_HEIGHT_PX) {
                        const ratio = MAX_IMG_HEIGHT_PX / renderHeight;
                        renderHeight = MAX_IMG_HEIGHT_PX;
                        renderWidth = renderWidth * ratio;
                    }
                    
                    if (renderWidth > maxScaledWidth) {
                        maxScaledWidth = renderWidth;
                    }

                    const imageId = workbook.addImage({
                        base64: base64Str,
                        extension: ext,
                    });
                    
                    // Center the image slightly inside the cell
                    sheet.addImage(imageId, {
                        tl: { col: 0, row: rowIndex - 1, colOff: 5, rowOff: 5 },
                        ext: { width: Math.round(renderWidth), height: Math.round(renderHeight) }
                    });
                }
            } catch (err) {
                console.error(`Failed to embed photo for ${student.fullName}`);
            }
        }
    });

    // Auto-adjust the photo column width to the widest scaled image
    sheet.getColumn(1).width = Math.min((maxScaledWidth / 7) + 2, 80);

    await workbook.xlsx.writeFile(outputFile);
    console.log('Successfully generated ' + outputFile);
}

main().catch(console.error);
