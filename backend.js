const express = require('express');
const path = require('path');
const cors = require('cors');
const moment = require('moment');
const mysql = require('mysql');
require('dotenv').config()

const app = express();
const port = 3000;

let db;

app.use(cors());
app.use(express.static('js-and-css'));

app.set('views', path.join(__dirname, 'views'));

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// Create MySQL connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB,
    connectionLimit: 10,
});

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/:steamId', (req, res) => {
    const steamId = req.params.steamId;

    userExists(steamId, (err, exists) => {
        if (err) {
            console.error('Error checking user existence:', err);
            res.status(400).render('user_not_found', { steamId });
            return;
        }

        if (exists) {
            res.status(200).render('user_stats', { steamId });
        } else {
            res.status(400).render('user_not_found', { steamId });
        }
    });
});

app.get('/stats/:steamId', (req, res) => {
    const steamId = req.params.steamId;

    if (!db) {
        console.error('Database instance not available.');
        res.status(500).json({error: 'Internal server error'})
        return;
    }

    let sql = "SELECT * FROM snapshots WHERE steamId = ? ORDER BY customTimestamp;";

    pool.query(sql, [steamId], (err, rows) => {
        
        if (err) {
            throw err;
        }

        if(rows.length == 0) {
            res.status(400).json({error: 'No data found for specified SteamID'});
        } else {
            res.status(200).json(rows);
        }

    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    createDB();
    clearDB();
    //generateUsers(10);

    var data;
    
    data = generateData(50, "STEAM_1:1:1");
    for (const snapshot of data) {
        insertSnapshot(snapshot);
        insertUser("STEAM_1:1:1");
    }
    data = generateData(50, "STEAM_1:1:2");
    for (const snapshot of data) {
        insertSnapshot(snapshot);
        insertUser("STEAM_1:1:2");
    }
    data = generateData(50, "STEAM_1:1:3");
    for (const snapshot of data) {
        insertSnapshot(snapshot);
        insertUser("STEAM_1:1:3");
    }
    data = generateData(50, "STEAM_1:1:4");
    for (const snapshot of data) {
        insertSnapshot(snapshot);
        insertUser("STEAM_1:1:4");
    }
    data = generateData(50, "STEAM_1:1:5");
    for (const snapshot of data) {
        insertSnapshot(snapshot);
        insertUser("STEAM_1:1:5");
    }

});

function createDB() {

    db = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB
    });

    db.connect((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the KZTracker database.');

        // Create tables using query method
        const createSnapshotsTable = `
            CREATE TABLE IF NOT EXISTS snapshots (
                id INT AUTO_INCREMENT PRIMARY KEY,
                steamId VARCHAR(255) NOT NULL,
                proPoints INT NOT NULL,
                proRecords INT NOT NULL,
                proCompletions INT NOT NULL,
                tpPoints INT NOT NULL,
                tpRecords INT NOT NULL,
                tpCompletions INT NOT NULL,
                ljPB FLOAT NOT NULL,
                customTimestamp VARCHAR(255) NOT NULL
            );`;

        const createUsersTable = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                steamId VARCHAR(255) NOT NULL
            );`;

        db.query(createSnapshotsTable, (err) => {
            if (err) {
                console.error(err.message);
            } else {
                console.log('Snapshots table created successfully.');
            }
        });

        db.query(createUsersTable, (err) => {
            if (err) {
                console.error(err.message);
            } else {
                console.log('Users table created successfully.');
            }
        });
    });
}



function clearDB() {
    if (!db) {
        console.error('Database instance not available.');
        return;
    }

    const clearSnapshots = 'DELETE FROM snapshots';
    db.query(clearSnapshots, (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Snapshots cleared successfully.');
        }
    });

    const clearUsers = 'DELETE FROM users';
    db.query(clearUsers, (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Users cleared successfully.');
        }
    });
}

function userExists(steamId, callback) {
    if (!db) {
        console.error('Database instance not available.');
        return;
    }

    let sql = "SELECT * FROM users WHERE steamId = ?;";

    db.query(sql, [steamId], (err, results) => {
        if (err) {
            console.error(err.message);
            callback(err, null);
            return;
        }

        const userExists = results.length > 0;

        callback(null, userExists);
    });
}

function insertSnapshot(snapshot) {
    if (!db) {
        console.error('Database instance not available.');
        return;
    }

    const insertQuery = `
        INSERT INTO snapshots (
            steamId, proPoints, proRecords, proCompletions,
            tpPoints, tpRecords, tpCompletions, ljPB, customTimestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            proPoints = VALUES(proPoints),
            proRecords = VALUES(proRecords),
            proCompletions = VALUES(proCompletions),
            tpPoints = VALUES(tpPoints),
            tpRecords = VALUES(tpRecords),
            tpCompletions = VALUES(tpCompletions),
            ljPB = VALUES(ljPB),
            customTimestamp = VALUES(customTimestamp);`;

    db.query(insertQuery, [
        snapshot.steamId,
        snapshot.proPoints,
        snapshot.proRecords,
        snapshot.proCompletions,
        snapshot.tpPoints,
        snapshot.tpRecords,
        snapshot.tpCompletions,
        snapshot.ljPB,
        snapshot.customTimestamp
    ], (err) => {
        if (err) {
            console.error(err.message);
        }
    });
}

function insertUser(steamId) {
    if (!db) {
        console.error('Database instance not available.');
        return;
    }

    const insertQuery = `
        INSERT IGNORE INTO users (
            steamId
        ) VALUES (?);
    `;

    db.query(insertQuery, [steamId], (err) => {
        if (err) {
            console.error(err.message);
        }
    });
}

function generateData(days, steamId) {

    const data = [];
    let proPoints = 2000;
    let proRecords = 3;
    let proCompletions = 7;
    let tpPoints = 100;
    let tpRecords = 1;
    let tpCompletions = 5;
    let ljPB = 270.00;

    const startDate = moment('2017-01-01');

    for (let i = 0; i < days; i++) {
        const customTimestamp = startDate.clone().add(i, 'days').format('YYYY-MM-DDTHH:mm:ss.SSS');

        data.push({
            steamId,
            proPoints,
            proRecords,
            proCompletions,
            tpPoints,
            tpRecords,
            tpCompletions,
            ljPB,
            customTimestamp
        });

        if (Math.random() > 0.25) { // 1 in 4 chance the player doesn't play per day
            proPoints += Math.floor(Math.random() * 1000) + 1;
            proRecords += Math.floor(Math.random()) + 1;
            proCompletions += Math.floor(Math.random() * 5) + 1;
            tpPoints += Math.floor(Math.random() * 500) + 1;
            tpRecords += Math.floor(Math.random()) + 1;
            tpCompletions += Math.floor(Math.random() * 4) + 1;

            if (Math.random() > 0.5) {
                ljPB += 0.3;
            }
        }
    }

    return data;
}

function generateUsers(amount){

    let ssTotal = 0;
    for(let i = 0; i < amount; i++){

        var data;
    
        let ssAmount = Math.floor(Math.random() * 500) + 1
        ssTotal += ssAmount;
        data = generateData(ssAmount, "STEAM_1:1:" + amount);
        for (const snapshot of data) {
            insertSnapshot(snapshot);
        }

        insertUser("STEAM_1:1:" + amount);
    }

    console.log(ssTotal);
}

/*const myData = [
      {steamId: "STEAM_1:1:1", proPoints: 2000, proRecords: 3, proCompletions: 7, tpPoints: 100, tpRecords: 1, tpCompletions: 5, customTimestamp: "2017-01-01T17:09:42.411" },
      { proPoints: 2500, proRecords: 5, proCompletions: 12, tpPoints: 150, tpCompletions: 8, customTimestamp: "2017-01-02T17:09:42.411" },
      { proPoints: 2800, proRecords: 7, proCompletions: 15, tpPoints: 180, tpCompletions: 10, customTimestamp: "2017-01-03T17:09:42.411" },
      { proPoints: 3200, proRecords: 9, proCompletions: 18, tpPoints: 200, tpCompletions: 12, customTimestamp: "2017-01-04T17:09:42.411" },
      { proPoints: 3700, proRecords: 12, proCompletions: 23, tpPoints: 250, tpCompletions: 15, customTimestamp: "2017-01-05T17:09:42.411" },
      { proPoints: 4100, proRecords: 15, proCompletions: 27, tpPoints: 300, tpCompletions: 18, customTimestamp: "2017-01-06T17:09:42.411" },
      { proPoints: 4500, proRecords: 18, proCompletions: 30, tpPoints: 350, tpCompletions: 20, customTimestamp: "2017-01-07T17:09:42.411" },
      { proPoints: 5000, proRecords: 22, proCompletions: 32, tpPoints: 400, tpCompletions: 22, customTimestamp: "2017-01-08T17:09:42.411" },
      { proPoints: 5500, proRecords: 26, proCompletions: 35, tpPoints: 450, tpCompletions: 25, customTimestamp: "2017-01-09T17:09:42.411" },
      { proPoints: 6000, proRecords: 30, proCompletions: 38, tpPoints: 500, tpCompletions: 28, customTimestamp: "2017-01-10T17:09:42.411" },
      { proPoints: 6500, proRecords: 35, proCompletions: 42, tpPoints: 550, tpCompletions: 30, customTimestamp: "2017-01-11T17:09:42.411" },
      { proPoints: 7000, proRecords: 40, proCompletions: 44, tpPoints: 600, tpCompletions: 32, customTimestamp: "2017-01-12T17:09:42.411" },
      { proPoints: 10000, proRecords: 40, proCompletions: 50, tpPoints: 1000, tpCompletions: 40, customTimestamp: "2017-01-13T17:09:42.411" }
    ];*/