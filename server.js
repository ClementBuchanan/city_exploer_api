
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
  const apikey = process.env.ZAMATO_API_KEY;
  const key = process.env.LOCATION_API_KEY;
  const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${searchedCity}&format=json`;

  const sqlContainment = 'SELECT * FROM city WHERE search_query=$1;';
  const sqlArray = [searchedCity];
  client.query(sqlContainment, sqlArray)
    .then(results => {
      if (results.rows.length > 0) {
        res.send(results.rows[0]);
      }
      else {
        superagent.get(url)
          .set('user-key', apikey)
          .then(result => {
            const newLocation = new Location(result.body[0], searchedCity);
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
        const forecast = weather.weather.description;
        const time = weather.ts;
        return new Weather(forecast, time);
      });
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

function movieHandler(req, res) {

  const searchedCity = req.query.search_query;
  const movieKey = process.env.MOVIE_API_KEY;
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${movieKey}&query=${searchedCity}`;
  superagent.get(url)
    .then(result => {
      const newMovie = result.body.results.map(movieTable => {
        return new Movie(movieTable);
      });
      console.log(newMovie);
      res.send(newMovie);
    })
    .catch(error => {
      res.status(500).send('please enter a city in the search field');
      console.log(error);
    });
}
app.get('/movies', (req, res) => movieHandler(req, res));


// ======== Yelp superagent & request/send ========

function yelpHandler(req, res) {
  const searchedCity = req.query.search_query;
  console.log(req.query);
  const yelpKey = process.env.YELP_API_KEY;
  const page = req.query.page;
  const start = (page - 1) * 3;
  const url = `https://api.yelp.com/v3/businesses/search?location=${searchedCity}&limit=3&offset=${start}`;
  superagent.get(url)
    .set('Authorization', `Bearer ${yelpKey}`)
    .then(result => {
      console.log(result.body[0]);
      const newYelp = result.body.businesses.map(business =>{
        return new Yelp(business);
      });
      res.send(newYelp);
    })
    .catch(error => {
      res.status(500).send('please enter a city in the search field');
      console.log(error);
    });
}
app.get('/yelp', (req, res) => yelpHandler(req, res));


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

function Movie(obj) {
  this.title = obj.original_title;
  this.overview = obj.overview;
  this.average_votes = obj.votes_average;
  this.total_votes = obj.votes_count;
  this.image_url = `https://image.tmdb.org/t/p/original${obj.poster_path}`;
  this.popularity = obj.popularity;
  this.released_on = obj.release_date;
}

function Yelp(obj) {
  this.name = obj.name;
  this.image_url = obj.image_url;
  this.price = obj.price;
  this.rating = obj.rating;
  this.url = obj.url;
}

// ===== Start the server =====

client.connect()
  .then(() => {
    app.listen(PORT, () => console.log(`You are on PORT ${PORT}`));
  });


