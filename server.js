
'use strict';

// ======= packages =======

const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

require('dotenv').config();

// =====setup application (server) ========

const app = express(); 
app.use(cors());

const PORT = process.env.PORT || 2021;

// ===== Routes =====

app.get('/', (req, res) => {
  res.send(`<h1>This server is running on port ${PORT}</h1>`);
});

// ====== superagent & location request/send  ======

function locationHandler(req, res) {
  const searchedCity = req.query.city;
  console.log(req.query);
  const key = process.env.LOCATION_API_KEY;
  const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${searchedCity}&format=json`;
  superagent.get(url)
    .then(result => {
      console.log(result.body[0]);
      const newLocation = new Location(result.body[0], searchedCity);
      console.log(newLocation);
      res.send(newLocation);
    })
    .catch(error => {
      res.status(500).send('please enter a city in the search field');
      console.log(error);
    });
}
app.get('/location', (req, res) => locationHandler(req, res));

// ====== weather superagent & request/send ======

app.get(`/weather`, (req, res) => {
  const key = process.env.WEATHER_API_KEY;
  const latitude = req.query.latitude;
  const longitude = req.query.longitude;
  const url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${latitude}&lon=${longitude}&hours=24&key=${key}&units=I`;
  superagent.get(url)
    .then(result => {

      const newArray = result.body.data.map(weather => {
        console.log(weather);
        const forecast = weather.weather.description;
        const time = weather.ts;
        return new Weather(forecast, time);
      });

      console.log(newArray);
      res.send(newArray);
    })
    .catch(error => {
      res.status(500).send('please enter a city in the search field');
      console.log(error);
    });
});

// ====== Trails request/send ======

app.get(`/parks`, (req, res) => {
  const key = process.env.PARKS_API_KEY;
  const url = `https://developer.nps.gov/api/v1/parks?q=${req.query.search_query}&api_key=${key}`;
  superagent.get(url)
    .then(result => {
      const parksArray = result.body.data.map(parkResults => {
        console.log(parkResults);
        return new Park(parkResults);
      });
      res.send(parksArray);
    })
    .catch(error => {
      res.status(500).send('please enter a city in the search field');
      console.log(error);
    });
});

// ===== Helper functions =====

function Location(obj, searchedCity) {
  this.search_query = searchedCity;
  this.formatted_query = obj.display_name;
  this.latitude = obj.lat;
  this.longitude = obj.lon;
}

function Weather(forecast, time) {
  this.forecast = forecast;
  this.time = new Date(time * 1000).toDateString();
}

function Park(obj) {
  this.tableName = 'parks';
  this.name = obj.fullName;
  this.address = `${obj.addresses[0].line1} ${obj.addresses[0].city} ${obj.addresses[0].stateCode} ${obj.addresses[0].postalCode}`;
  this.fee = obj.entranceFees[0].cost;
  this.description = obj.description;
  this.url = obj.url;
}

// ===== Start the server =====

app.listen(PORT, () => console.log(`You are on PORT ${PORT}`));
