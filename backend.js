const express = require('express');
const path = require('path');
const cors = require('cors');
const moment = require('moment');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.static('js'));

app.set('views', path.join(__dirname, 'views'));

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/:steamid', (req, res) => {
  const steamid = req.params.steamid;
  res.render('user_stats', { steamid: JSON.stringify(steamid) });
});

app.get('/stats/:steamid', (req, res) => {
  // Access database and get stats for the given steamid, json response

  const steamid = req.params.steamid;

  const myData = [
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
  ];

  res.json(generateData(400));

  console.log("MANUAL------------------------");
  console.log(myData[0]);
  console.log("GENERATED---------------------");
  console.log(generateData(10)[0]);
  //res.json(generateData(10));

})

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

function generateData(days) {
    const data = [];
    let proPoints = 2000;
    let proRecords = 3;
    let proCompletions = 7;
    let tpPoints = 100;
    let tpCompletions = 5;

    const startDate = moment('2017-01-01');

    for (let i = 0; i < days; i++) {
        // Use format() to generate a custom formatted timestamp without the 'Z'
        const timestamp = startDate.clone().add(i, 'days').format('YYYY-MM-DDTHH:mm:ss.SSS');

        data.push({
            proPoints,
            proRecords,
            proCompletions,
            tpPoints,
            tpCompletions,
            timeStamp: timestamp,
        });

        // Update values for the next day
        proPoints += Math.floor(Math.random() * 100) + 1;
        proRecords += Math.floor(Math.random() * 3) + 1;
        proCompletions += Math.floor(Math.random() * 5) + 1;
        tpPoints += Math.floor(Math.random() * 50) + 1;
        tpCompletions += Math.floor(Math.random() * 5) + 1;
    }

    return data;
}