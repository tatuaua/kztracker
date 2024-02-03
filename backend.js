const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());

app.set('views', path.join(__dirname, 'views'));

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/:steamid', (req, res) => {
  const steamid = req.params.steamid;
  res.render('user_stats', { steamid });
});

app.get('/stats/:steamid', (req, res) => {
  console.log("endpoint caasdlled")
  // Access database and get stats for the given steamid, json response

  const steamid = req.params.steamid;

  res.json([
    { proPoints: 2000, proRecords: 3, timeStamp: "2017-01-01T17:09:42.411" },
    { proPoints: 2500, proRecords: 5, timeStamp: "2017-01-02T17:09:42.411" },
    { proPoints: 2800, proRecords: 7, timeStamp: "2017-01-03T17:09:42.411" },
    { proPoints: 3200, proRecords: 9, timeStamp: "2017-01-04T17:09:42.411" },
    { proPoints: 3700, proRecords: 12, timeStamp: "2017-01-05T17:09:42.411" },
    { proPoints: 4100, proRecords: 15, timeStamp: "2017-01-06T17:09:42.411" },
    { proPoints: 4500, proRecords: 18, timeStamp: "2017-01-07T17:09:42.411" },
    { proPoints: 5000, proRecords: 22, timeStamp: "2017-01-08T17:09:42.411" },
    { proPoints: 5500, proRecords: 26, timeStamp: "2017-01-09T17:09:42.411" },
    { proPoints: 6000, proRecords: 30, timeStamp: "2017-01-10T17:09:42.411" },
    { proPoints: 6500, proRecords: 35, timeStamp: "2017-01-11T17:09:42.411" },
    { proPoints: 7000, proRecords: 40, timeStamp: "2017-01-12T17:09:42.411" },
    { proPoints: 10000, proRecords: 40, timeStamp: "2017-01-13T17:09:42.411" }
]);

})

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});