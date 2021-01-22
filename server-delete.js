
'use strict';

// ======= packages =======

// this implies that express has already been downloaded via npm. the command for downloading and saving it is  `npm install -S express`

const express = require('express');
const cors = require('cors');
// const { response } = require('express');
require('dotenv').config();
const superagent = require('superagent');

// =====setup application (server) ========

const app = express(); // creates server from the Express library
app.use(cors());
// loads the middleware. We are loadig cors so that requests don't get blocked.

// ===== Global variables =====
// process.env.PORT references the the PORT env variable from the terminal

const PORT = process.env.PORT || 2021;

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


// ====== superagent & location request/send  ======

function locationHandler(req, res) {
  const searchedCity = req.query.city;
  // console.log(req.query);
  const key = process.env.LOCATION_API_KEY;
  const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${searchedCity}&format=json`;

  superagent.get(url)
    .then(result => {
    // console.log(result.body[0]);
    const newLocation = new Location(result.body[0], searchedCity);
    console.log(newLocation);
      // const location = result.body[0];
      // const newLocation = new Location(
      //   searchedCity,
      //   location.display_name,
      //   location.lat,
      //   location.lon
      // );
      res.send(newLocation);
    })
    .catch(error => {
      res.status(500).send('please enter a city in the search field');
      // console.log(error);
    });
}

app.get('/location', (req, res) => locationHandler(req, res));

// create a route with an end point of location
// location request/send
// app.get('/location', (req, res) => {
//   // we need to normalize our data with a constructor
//   const newLocation = require('./data/location.json'); // require gets
//   const location = newLocation[0];

//   // data from the client (search query they submitted)
//   console.log('req.query', req.query);

//   const searchedCity = req.query.city;
//   const site = new Location(searchedCity,
//     location.display_name,
//     location.lat,
//     location.lon
//   );
//   res.send(site);
// });

// ====== weather superagent & request/send ======

app.get(`/weather`, (req, res) => {
  const key = process.env.WEATHER_API_KEY
  const latitude = req.query.latitude;
  const longitude = req.query.longitude;
  const url = `https://api.weatherbit.io/v2.0/forecast/hourly?lat=${latitude}&lon=${longitude}&hours=24&key=${key}&units=I`;
  superagent.get(url)
    .then(result => {
      function Weather(forecast, time) {
        this.forecast = forecast;
        this.time = new Date(time * 1000).toDateString();
      }
    });
});

// ====== Trails request/send ======

app.get(`/parks`, (req, res) => {
  const key = process.env.PARKS_API_KEY;
  const parkName = req.query.parkName;
  const parkLocation = req.query.parkLocation;
  console.log('000000000', req.query);
  const url = `https://${key}@developer.nps.gov/api/v1/parks?parkCode=acad?${parkName}&parkLocation=${parkLocation}`;
  superagent.get(url)
    .then(result => {
      result.body.data.map(parkResults => {
        // console.log(parkResults);
      })
      // console.log(result.body.data, '!!!!!!!!!!!!!!!!!');
      // const parks = new Park(result);
      // function Park(parkName, parkLocation) {
      //   this.parkName = park_name;
      //   this.parkLocation = park_location;
      // }
    });
});


// ===== Helper functions =====

function Location(obj, searchedCity) {
  this.search_query = searchedCity;
  this.display_name = obj.display_name;
  this.latitude = obj.lat;
  this.longitude = obj.lon;
}

function Weather(forecast, time) {
  this.forecast = forecast;
  this.time = new Date(time * 1000).toDateString();
}

function Park(search_query, formatted_query, park_name, park_location) {
  this.search_query = search_query;
  this.formatted_query = formatted_query;
  this.parkName = park_name;
  this.parkLocation = park_location;
}

// ===== Start the server =====

app.listen(PORT, () => console.log(`You are on PORT ${PORT}`));
