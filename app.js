const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const userRoute = require("./api/routes/user");
const coinbaseRoute = require("./api/routes/coinbase");

mongoose.connect(
  `mongodb+srv://${process.env.MONGO_ATLAS_USER}:${process.env.MONGO_ATLAS_PW}@free-cluster-penp7.mongodb.net/test?retryWrites=true`,
  { 
    dbName: "btc",
    useNewUrlParser: true
  },
  (err,client) => {
    if(err){ console.log(err); }
    else { console.log("connected"); }
  }
);

// Middlewares
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({
  extended : false
}));
app.use(bodyParser.json());

// CORS setting
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
      return res.status(200).json({});
  }
  next();
});

// Routes which should handle requests
app.use("/user", userRoute);
app.use("/coinbase", coinbaseRoute);


/* handleing Errors*/
// no path
app.use((req, res, next) => {
  const error = new Error('Not found');
  error.status = 404;
  next(error);
});

// if error is thrown 
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

module.exports = app;