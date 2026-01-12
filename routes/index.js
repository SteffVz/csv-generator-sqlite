var express = require('express');
var router = express.Router();

const { createCSVStream } = require('../utils/csvGenerator');
const fs = require('fs');
const db = require('../db');

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

/* GET home page */
router.get('/', function (req, res) {
    res.render('index', { title: 'Express' });
});

/* POST: generate CSV */
router.post('/generate', function (req, res) {
    const count = parseInt(req.body.count);

    if (isNaN(count) || count <= 0 || count > 1_000_000) {
        return res.send("Enter a valid positive number (max 1,000,000)");
    }

    createCSVStream(count);
    res.send(`CSV file generated with ${count} records (check output.csv)`);
});


/* POST: upload CSV into SQLite 
router.post('/upload', upload.single('csvfile'), (req, res) => {
    if (!req.file) return res.send("No file uploaded");

    const fileContent = fs.readFileSync(req.file.path, 'utf8');
    const lines = fileContent.split('\n').slice(1);

    let count = 0;

    db.serialize(() => {
        const stmt = db.prepare(`
            INSERT INTO csv_import
            (id, name, surname, initials, age, date_of_birth)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        for (const line of lines) {
            if (!line.trim()) continue;
            const [id, name, surname, initials, age, dob] = line.split(',');
            stmt.run(id, name, surname, initials, age, dob);
            count++;
        }

        stmt.finalize();
        res.send(`Imported ${count} records`);
    });
});
*/


//optimized upload route
const readline = require('readline');

router.post('/upload', upload.single('csvfile'), (req, res) => {
    if (!req.file) return res.send("No file uploaded");

    const fileStream = fs.createReadStream(req.file.path);
    const rl = require('readline').createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let rows = [];
    let isHeader = true;

    rl.on('line', (line) => {
        if (isHeader) {
            isHeader = false;
            return;
        }

        if (!line.trim()) return;

        rows.push(line.split(','));
    });

    rl.on('close', () => {
        console.log("FILE READ COMPLETE:", rows.length);

        db.serialize(() => {
            db.run("DELETE FROM csv_import");
            db.run("BEGIN TRANSACTION");

            const stmt = db.prepare(`
                INSERT INTO csv_import
                (id, name, surname, initials, age, date_of_birth)
                VALUES (?, ?, ?, ?, ?, ?)
            `);

            for (const row of rows) {
                stmt.run(row);
            }

            stmt.finalize();
            db.run("COMMIT", (err) => {
                if (err) {
                    console.error(err.message);
                    return res.send("Commit failed");
                }

                res.send(`Imported ${rows.length} records`);
            });
        });
    });
});


/* GET: count records */
router.get('/count', (req, res) => {
    db.get('SELECT COUNT(*) AS total FROM csv_import', (err, row) => {
        if (err) return res.send("Error: " + err.message);
        res.send(`Total records in database: ${row.total}`);
    });
});

/* GET: view rows */
router.get('/view', (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    db.all('SELECT * FROM csv_import LIMIT ? OFFSET ?', [limit, offset], (err, rows) => {
        if (err) return res.send("Error: " + err.message);
        res.json(rows);
    });
});

module.exports = router;
