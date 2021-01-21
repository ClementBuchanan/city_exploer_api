
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

// ====== location request ======

// create a route with an end point of location
// location request/send
app.get('/location', (req, res) => {


  // we need to normalize our data with a constructor
  const newLocation = require('./data/location.json'); // require gets things from a fle
  const location = newLocation[0];

  // data from the client (search query they submitted)
  console.log('req.query', req.query);

  const searchedCity = req.query.city;
  const site = new Location(searchedCity,
    location.display_name,
    location.lat,
    location.lon
  );
  res.send(site);
});

// res.send({
//   'search_query': 'seattle',
//   'formatted_query': 'Seattle, WA, USA',
//   'latitude': '47.606210',
//   'longitude': '-122.332071'
// });
// if (!req.query.city) {
//   res.status(500).send('Sorry, something went terribly wrong');
// };

// ====== weather request/send ======

app.get(`/weather`, (req, res) => {
  
  const dummyWeatherData = require('./data/weather.json'); // require gets things from a fle

  
  
  // const dummyWeatherData = [
  //   {
  //     'forecast': 'Its going to rain like it has never rained before.',
  //     'time': 'Monday January 18 2021',
  //   },
  //   {
  //     'forecast': 'Its going to be cloudy with a chance of meatballs.',
  //     'time': 'Tuesday January 19 2021',
  //   },
  // ];
  // ====== return weather object ======
  const arr = dummyWeatherData.data.map(jsonObj => {
    return new Weather(jsonObj.weather.description, jsonObj.ts);
  });
  res.send(arr);
});

// ===== Helper functions =====

function Location(search_query, formatted_query, latitude, longitude) {
  this.search_query = search_query;
  this.formatted_query = formatted_query;
  this.latitude = latitude;
  this.longitude = longitude;
}

function Weather(forecast, time) {
  this.forecast = forecast;
  this.time = new Date(time * 1000).toDateString ();
}

// ===== Start the server =====

app.listen(PORT, () => console.log(`You are on PORT ${PORT}`));
