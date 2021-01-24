
'use strict';

// ======= packages =======

const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');

require('dotenv').config();

// =====setup application (server) ========

const app = express();
app.use(cors());
const PORT = process.env.PORT || 2021;
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.error(err));


// ===== Routes =====

app.get('/', (req, res) => {
  res.send(`<h1>This server is running on port ${PORT}</h1>`);
});

// ====== location superagent & request/send  ======

function locationHandler(req, res) {
  const searchedCity = req.query.city;
  console.log(req.query);
  const apikey = process.env.ZAMATO_API_KEY;
  const key = process.env.LOCATION_API_KEY;
  const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${searchedCity}&format=json`;

  const sqlContainment = 'SELECT * FROM city WHERE search_query=$1;';
  const sqlArray = [searchedCity];
  client.query(sqlContainment, sqlArray)
    .then(results => {
      if (results.rows.length > 0) {
        console.log('This information came the database');
        res.send(results.rows[0]);
      }
      else {
        superagent.get(url)
          .set('user-key', apikey)
          .then(result => {
            console.log(result.body[0]);
            const newLocation = new Location(result.body[0], searchedCity);
            console.log(newLocation);
            const sqlStatement = 'INSERT INTO city (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4);';
            const valArray = [newLocation.search_query, newLocation.formatted_query, newLocation.latitude, newLocation.longitude];
            client.query(sqlStatement, valArray);
            res.send(newLocation);
          });
      }
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

// ====== Parks superagent & request/send ======

function parksHandler(req, res) {
  // app.get(`/parks`, (req, res) => {
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
}
app.get('/parks', (req, res) => parksHandler(req, res));


// ======= Movies superagent & request/send ==========

app.get(`/movies`, (req, res) => {
  const mkey = process.env.MOVIE_API_KEY;
  const title = req.query.title;
  const overview = req.query.overview;
  const average_votes = req.query.average_votes;
  const total_votes = req.query.total_votes;
  const popularity = req.query.popularity;
  const released_on = req.query.released_on;
  const url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${latitude}&lon=${longitude}&hours=24&key=${key}&units=I`;
  superagent.get(url)
    .then(result => {
      if (results.rows.length <= 20) {
        console.log('The twenty most polular movies in the area');
        res.send(results.rows[0]);
      const moviesArray = result.body.data.map(movies => {
        console.log(movies);
        const forecast = weather.weather.description;
        const time = movies.ts;
        return new Movies(forecast, time);
      });
      console.log(moviesArray);
      res.send(moviesArray);
    })
    .catch(error => {
      res.status(500).send('please enter a movie in the search field');
      console.log(error);
    });
});


// ======== Yelp superagent &  request/send ========

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

function Movie(forecast, time) {
  this.forecast = forecast;
  this.time = new Date(time * 1000).toDateString();
}

function Yelp(forecast, time) {
  this.forecast = forecast;
  this.time = new Date(time * 1000).toDateString();
}

// ===== Start the server =====

client.connect()
  .then(() => {
    app.listen(PORT, () => console.log(`You are on PORT ${PORT}`));
  });


