const https = require('https');
const fs = require('fs');

const fontUrl = "https://fonts.gstatic.com/s/materialsymbolsoutlined/v362/kJF1BvYX7BgnkSrUwT8OhrdQw4oELdPIeeII9v6oDMzByHX9rA6RzaxHMPdY43zj-jCxv3fzvRNU22ZXGJpEpjC_1v-p_4MrImHCIJIZrDCvHOem.ttf";

const file = fs.createWriteStream("public/material-symbols-outlined.ttf");
https.get(fontUrl, (fontRes) => {
  fontRes.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log("Font downloaded successfully.");
  });
}).on('error', (e) => {
  console.error(e);
});
