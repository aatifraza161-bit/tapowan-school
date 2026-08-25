const fs = require('fs');
const path = require('path');

const dataFile = './students_dump.json';
const exportDir = 'C:/Users/Admin/Desktop/Student_Photos_Export';

async function main() {
    if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir);
    }

    const rawData = fs.readFileSync(dataFile, 'utf8');
    const students = JSON.parse(rawData);
    
    let count = 0;

    students.forEach((student) => {
        const photoDataUrl = student.photo;
        if (photoDataUrl && photoDataUrl.startsWith('data:image')) {
            try {
                const match = photoDataUrl.match(/^data:image\/(png|jpeg|jpg);base64,(.+)$/);
                if (match && match[2]) {
                    const ext = match[1] === 'jpeg' ? 'jpg' : 'png';
                    const base64Str = match[2];
                    
                    // Sanitize file name
                    const safeName = (student.fullName || 'Unknown').replace(/[^a-z0-9]/gi, '_');
                    const roll = (student.rollNo || 'NoRoll').replace(/[^a-z0-9]/gi, '_');
                    const fileName = `${roll}_${safeName}.${ext}`;
                    const filePath = path.join(exportDir, fileName);
                    
                    fs.writeFileSync(filePath, Buffer.from(base64Str, 'base64'));
                    count++;
                }
            } catch (err) {
                console.error(`Failed to export photo for ${student.fullName}`);
            }
        }
    });

    console.log(`Successfully exported ${count} photos to ${exportDir}`);
}

main().catch(console.error);
