const fs = require('fs');




const writer = function () {
    // Get the current date and time
const currentDate = new Date().toLocaleString();

// Create an object with the date and time
const data = {
    datetime: currentDate
};

// Convert the object to JSON
const jsonData = JSON.stringify(data);
    // Write the JSON data to a file
//    fs.writeFile('datetime.json', jsonData, 'utf8', (err) => {
//        if (err) {
//            console.error('Error writing JSON file:', err);
//        } else {
//            console.log('JSON file has been written successfully!');
//        }
//    });
    fs.writeFile('../js/timestamp.js', 'let timestamp = ' + jsonData, 'utf8', (err) => {
        if (err) {
            console.error('Error writing JSON file:', err);
        } else {
            console.log('JSON file has been written successfully!');
        }
    });
}
writer();
let i = setInterval(writer, 10000);
