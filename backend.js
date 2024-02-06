const express = require('express');
const path = require('path');
const cors = require('cors');
const moment = require('moment');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

let db;

app.use(cors());
app.use(express.static('js'));

app.set('views', path.join(__dirname, 'views'));

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/:steamId', (req, res) => {
    const steamId = req.params.steamId;
    res.render('user_stats', { steamId: JSON.stringify(steamId) });
});

app.get('/stats/:steamId', (req, res) => {
    // Access database and get stats for the given steamid, json response

    const steamId = req.params.steamId;

     // Check if the database instance is available
     if (!db) {
        console.error('Database instance not available.');
        return;
    }

    console.log(steamId);

    let sql = "SELECT * FROM snapshots WHERE steamId == " + steamId ;

    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
        rows.forEach((row) => {
            console.log(row.steamId);
        });
    });

    res.json(generateData(400));

})

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    createDB();

    data = generateData(400);
    for (const snapshot of data) {
        insertSnapshot(snapshot);
    }
});

function createDB() {
    db = new sqlite3.Database('./kztracker.db', sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the KZTracker database.');

        // Create the snapshots table
        db.run(`CREATE TABLE IF NOT EXISTS snapshots (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          steamId TEXT NOT NULL,
          proPoints INTEGER NOT NULL,
          proRecords INTEGER NOT NULL,
          proCompletions INTEGER NOT NULL,
          tpPoints INTEGER NOT NULL,
          tpRecords INTEGER NOT NULL,
          tpCompletions INTEGER NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP);`,
            (err) => {
                if (err) {
                    console.error(err.message);
                } else {
                    console.log('Snapshots table created successfully.');
                }
            });
    });
}

function insertSnapshot(snapshot) {
    // Check if the database instance is available
    if (!db) {
        console.error('Database instance not available.');
        return;
    }

    // Insert the snapshot into the snapshots table
    const insertQuery = `
        INSERT INTO snapshots (
            steamId, proPoints, proRecords, proCompletions,
            tpPoints, tpRecords, tpCompletions
        ) VALUES (?, ?, ?, ?, ?, ?, ?);
    `;

    db.run(insertQuery, [
        snapshot.steamId,  // Correct the key to match the case
        snapshot.proPoints,
        snapshot.proRecords,
        snapshot.proCompletions,
        snapshot.tpPoints,
        snapshot.tpRecords,
        snapshot.tpCompletions
    ], (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Snapshot inserted successfully.');
        }
    });
}

function generateData(days) {
    const data = [];
    let steamId = "STEAM_1:1:1";
    let proPoints = 2000;
    let proRecords = 3;
    let proCompletions = 7;
    let tpPoints = 100;
    let tpRecords = 1;
    let tpCompletions = 5;

    const startDate = moment('2017-01-01');

    for (let i = 0; i < days; i++) {
        // Use format() to generate a custom formatted timestamp without the 'Z'
        const timestamp = startDate.clone().add(i, 'days').format('YYYY-MM-DDTHH:mm:ss.SSS');

        data.push({
            steamId,
            proPoints,
            proRecords,
            proCompletions,
            tpPoints,
            tpRecords,
            tpCompletions,
            timeStamp: timestamp,
        });

        // Update values for the next day
        if (Math.random() > 0.25) { // 1 in 4 chance the player doesnt play per day
            proPoints += Math.floor(Math.random() * 1000) + 1;
            proRecords += Math.floor(Math.random()) + 1;
            proCompletions += Math.floor(Math.random() * 5) + 1;
            tpPoints += Math.floor(Math.random() * 500) + 1;
            tpRecords += Math.floor(Math.random()) + 1;
            tpCompletions += Math.floor(Math.random() * 4) + 1;
        }

        steamId = "STEAM_1:1:" + Math.floor(Math.random() * 10) + 1;
    }

    return data;
}

/*const myData = [
      { proPoints: 2000, proRecords: 3, proCompletions: 7, tpPoints: 100, tpCompletions: 5, timeStamp: "2017-01-01T17:09:42.411" },
      { proPoints: 2500, proRecords: 5, proCompletions: 12, tpPoints: 150, tpCompletions: 8, timeStamp: "2017-01-02T17:09:42.411" },
      { proPoints: 2800, proRecords: 7, proCompletions: 15, tpPoints: 180, tpCompletions: 10, timeStamp: "2017-01-03T17:09:42.411" },
      { proPoints: 3200, proRecords: 9, proCompletions: 18, tpPoints: 200, tpCompletions: 12, timeStamp: "2017-01-04T17:09:42.411" },
      { proPoints: 3700, proRecords: 12, proCompletions: 23, tpPoints: 250, tpCompletions: 15, timeStamp: "2017-01-05T17:09:42.411" },
      { proPoints: 4100, proRecords: 15, proCompletions: 27, tpPoints: 300, tpCompletions: 18, timeStamp: "2017-01-06T17:09:42.411" },
      { proPoints: 4500, proRecords: 18, proCompletions: 30, tpPoints: 350, tpCompletions: 20, timeStamp: "2017-01-07T17:09:42.411" },
      { proPoints: 5000, proRecords: 22, proCompletions: 32, tpPoints: 400, tpCompletions: 22, timeStamp: "2017-01-08T17:09:42.411" },
      { proPoints: 5500, proRecords: 26, proCompletions: 35, tpPoints: 450, tpCompletions: 25, timeStamp: "2017-01-09T17:09:42.411" },
      { proPoints: 6000, proRecords: 30, proCompletions: 38, tpPoints: 500, tpCompletions: 28, timeStamp: "2017-01-10T17:09:42.411" },
      { proPoints: 6500, proRecords: 35, proCompletions: 42, tpPoints: 550, tpCompletions: 30, timeStamp: "2017-01-11T17:09:42.411" },
      { proPoints: 7000, proRecords: 40, proCompletions: 44, tpPoints: 600, tpCompletions: 32, timeStamp: "2017-01-12T17:09:42.411" },
      { proPoints: 10000, proRecords: 40, proCompletions: 50, tpPoints: 1000, tpCompletions: 40, timeStamp: "2017-01-13T17:09:42.411" }
    ];*/