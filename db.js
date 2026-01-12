const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('data.db'); //the database file

//create the table if it does not exist
db.serialize(() => {
    db.run(`
    CREATE TABLE IF NOT EXISTS csv_import (
      id INTEGER PRIMARY KEY,
      name TEXT,
      surname TEXT,
      initials TEXT,
      age INTEGER,
      date_of_birth TEXT
    )
  `);
});

module.exports = db;