const fs = require('fs');
const path = require('path');

async function testUpload() {
  const filePath = path.join(__dirname, 'test_holidays.xlsx');
  const fileContent = fs.readFileSync(filePath);
  
  // We'll use form-data manually since we're in node
  const FormData = require('form-data');
  const form = new FormData();
  form.append('excelFile', fileContent, 'test_holidays.xlsx');

  console.log('Sending upload request to http://localhost:5000/api/holidays/upload ...');
  
  try {
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    const response = await fetch('http://localhost:5000/api/holidays/upload', {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });

    const data = await response.json();
    console.log('Response:', data);
  } catch (err) {
    console.error('Error during upload:', err);
  }
}

testUpload();
