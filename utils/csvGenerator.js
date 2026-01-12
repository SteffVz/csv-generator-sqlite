// utils/csvGenerator.js
const fs = require('fs');
const path = require('path');

// 20 names and 20 surnames arrays
const names = [
    "Sean", "Anna", "John", "Peter", "Liam",
    "Noah", "Emma", "Olivia", "Ava", "Sophia",
    "Mason", "Lucas", "Ethan", "James", "Logan",
    "Ella", "Mia", "Charlotte", "Amelia", "Isla"
];

const surnames = [
    "Smith", "Johnson", "Brown", "Taylor", "Anderson",
    "Thomas", "Jackson", "White", "Harris", "Martin",
    "Thompson", "Garcia", "Martinez", "Robinson", "Clark",
    "Rodriguez", "Lewis", "Lee", "Walker", "Hall"
];

// Helper functions
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate random DOB based on age
function randomDate(age) {
    const year = new Date().getFullYear() - age;
    const month = randomInt(1, 12);
    const day = randomInt(1, 28);
    return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
}

// Generate CSV file
async function createCSVStream(recordCount) {
    return new Promise((resolve, reject) => {
        const outputPath = path.join(__dirname, '../output/output.csv');

        // Ensure output folder exists
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });

        const stream = fs.createWriteStream(outputPath);
        stream.write("Id,Name,Surname,Initials,Age,DateOfBirth\n");

        const existing = new Set(); // track uniqueness
        let id = 1;

        function generateRow() {
            const name = names[randomInt(0, names.length - 1)];
            const surname = surnames[randomInt(0, surnames.length - 1)];
            const age = randomInt(18, 80);
            const dob = randomDate(age);
            const initials = name[0];

            // uniqueness hash
            const hash = `${name}|${surname}|${age}|${dob}`;
            if (existing.has(hash)) return false; // duplicate, skip
            existing.add(hash);

            stream.write(`${id},${name},${surname},${initials},${age},${dob}\n`);
            id++;
            return true;
        }

        // generate in blocks
        function generateBatch() {
            while (id <= recordCount) {
                if (!generateRow()) continue; // skip duplicates
                // periodically yield to event loop to avoid blocking
                if (id % 10000 === 0) {
                    setImmediate(generateBatch);
                    return;
                }
            }
            stream.end();
            resolve(recordCount);
        }

        generateBatch();
    });
}

module.exports = { createCSVStream };
