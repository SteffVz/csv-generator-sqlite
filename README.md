# CSV Generator and SQLite Importer (Node.js and Express)

This project is a Node.js and Express web application that generates large CSV files and imports them efficiently into a SQLite database using streaming and transactions.

It is designed to handle large datasets (up to 1,000,000 records) without freezing or crashing the server.


## Features

- Generate CSV files with random user data
- Stream CSV generation (non-blocking)
- Upload CSV files via a web interface
- Import CSV data into SQLite using transactions
- Batch processing for performance
- View imported records and record count
- Clean Express project structure


## Project Structure

bin/
  www                  Server entry point

routes/
  index.js             Main routes
  users.js

utils/
  csvGenerator.js      CSV streaming logic

views/
  index.pug            Main UI
  error.pug

db.js                  SQLite database setup
server.js              Express app configuration
package.json
package-lock.json
README.md


## Technologies Used

- Node.js
- Express
- SQLite3
- Multer (file uploads)
- Pug (templating engine)
- fs streams


## Installation and Running

Clone the repository:

git clone <your-github-repo-url>
cd <project-folder>


Install dependencies:

npm install


Run the server:

npm start


The application will run at:

http://localhost:3000
