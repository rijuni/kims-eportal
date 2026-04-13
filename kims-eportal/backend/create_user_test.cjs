const xlsx = require('xlsx');
const path = require('path');

const data = [
  ['sl.no', 'date', 'days', 'no. of days', 'event'],
  [1, '23-01-2026', 'Friday', 1, 'Saraswati Puja'],
  [2, '26-01-2026', 'Monday', 1, 'Republic Day']
];

const ws = xlsx.utils.aoa_to_sheet(data);
const wb = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(wb, ws, 'Holidays');

const filePath = path.join(__dirname, 'test_user_headers.xlsx');
xlsx.writeFile(wb, filePath);

console.log('Created test_user_headers.xlsx at ' + filePath);
