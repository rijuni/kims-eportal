const xlsx = require('xlsx');
const path = require('path');

const data = [
  ['Sl No', 'Date', 'Days', 'No of Days', 'Event'],
  [1, '23-01-2026', 'Friday', 1, 'Saraswati Puja'],
  [2, '26-01-2026', 'Monday', 1, 'Republic Day']
];

const ws = xlsx.utils.aoa_to_sheet(data);
const wb = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(wb, ws, 'Holidays');

const filePath = path.join(__dirname, 'test_holidays.xlsx');
xlsx.writeFile(wb, filePath);

console.log('Created test_holidays.xlsx at ' + filePath);
