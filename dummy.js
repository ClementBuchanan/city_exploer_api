
'use strict';

// ======= packages =======

// this implies that express has already been downloaded via npm. the command for downloading and saving it is  `npm install -S express`

const express = require('express');
const cors = require('cors');
// const { response } = require('express');
require('dotenv').config();

// =====setup application (server) ========

const app = express(); // creates server from the Express library
app.use(cors());
// loads the middleware. We are loadig cors so that requests don't get blocked.

// ===== Global variables =====
// process.env.PORT references the the PORT env variable from the terminal

const PORT = process.env.PORT || 3005;

// ===== Routes =====
// app.get: attaches a listener of method type GET to the server with a (route and a callback)
// '/': route you can visit the server at localhost:3000/ and trigger the callback.
// (request, response) => : the callback function
// request: data requeted by client
// response : data sent back to the client
// response.send (<anything>): takes the argument and send it back to the client

app.get('/', (req, res) => {
  res.send(`<h1>This server is running on port ${PORT}</h1>`);
});


// expect a key value pair of name:rasta and lastName:dog
// send `rasta dog`
// this lives with all the client data, in the `request (req)` parameter
// inside request will always live a property  query: { name: 'rasta', lastName: 'dog' },


// create a route with an end point of location
// location request/send

app.get('/location', (req, res) => {
  console.log(req.query.city);
  res.send({
    'search_query': 'seattle',
    'formatted_query': 'Seattle, WA, USA',
    'latitude': '47.606210',
    'longitude': '-122.332071'
  });
  // if (!req.query.city) {
  //   res.status(500).send('Sorry, something went terribly wrong');
});

// ====== weather request/send ======
app.get('/weather', (req, res) => {
  const dummyWeatherData = [
    {
      'forecast': 'Its going to rain like it has never rained before.',
      'time': 'Monday January 18 2021',
    },
    {
      'forecast': 'Its going to be cloudy with a chance of meatballs.',
      'time': 'Tuesday January 19 2021',
    },
  ];
  // ====== return weather object ======
  const arr = [];
  dummyWeatherData.forEach(jsonObj => {
    const weather = new weather(jsonObj);
    arr.push(weather);
  });
  res.send(arr);
  // if (!req.query.city) {
  //   res.status(500).send('Sorry, something went terribly wrong');
  //   return;
  // }
});

// ===== Helper functions =====

function Location(search_query, formatted_query, latitude, longitude) {
  this.search_query = search_query;
  this.latitude = latitude;
  this.longitude = longitude;
}

// ===== Start the server =====

app.listen(PORT, () => console.log(`You are on PORT ${PORT}`));

// ===== Error handling function ======

// if (!req.query.city) {
//   res.status(500).send('Sorry, something went terribly wrong');
//   return;
// }

// ====== return to normal with Location function ======
// const dataArrayfromJsonLocation = require('./data/location.json');
// const dataFromJsonLocation = dataArrayFromJsonLocation[0];