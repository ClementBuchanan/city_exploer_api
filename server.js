'use strict';

// ======= packages =======

// this implies that express has already been downloaded via npm. the command for downloading and saving it is  `npm install -S express`

const express = require('express');
const cors = require('cors');
// const { response } = require('express');
require ('dotenv').config();

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

app.get ('/', (request, response) => {
  response.send('You are here   ');
});

// localhost:3333/rasta-dog?name=rastaDog&lastName=dog
// expect a key value pair of name:rasta and lastName:dog
// send `rasta dog`
// this lives with all the client data, in the `request (req)` parameter
// inside request will always live a property  query: { name: 'rasta', lastName: 'dog' },

// app.get('/ pet-the-pet', (req, res) => {
//   console.log(req.query.name);
//   let str = '';
//   for(let i = 0; i < req.query.quantity, 1++) {
//     str += `petting${req.query.name} ${req.query.lastname} <br />`;
//   }
//   res.send(str);
// });

app.get('/location', (req, res) => {
  const data = require('./data/location.json');
  const arr = [];
  data.location.forEach(jsonObj => {
    const location = new Location(jsonObj);
    arr.push(location);
  });

  res.resend(arr);
});

// ===== Helper functions =====

function Location(search_query, formatted_query, latitude, longitude){
  this.search_query = search_query;
  this.longitude = longitude;
  this.latitude = latitude;
}

function newLocation(jsonObj) {
  this.location = jsonObj.location.name;
  this.locality = jsonObj.location.location.locality_verbose;this.cuisine = jsonObj.restaurnt.cuisine;
}

// ===== Start the server =====

app.listen(PORT, () => console.log (`You are on PORT ${PORT}`));
