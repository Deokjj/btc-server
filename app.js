const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const passport     = require('passport');

const userRoute = require("./api/routes/user");
const coinbaseRoute = require("./api/routes/coinbase");

require('./passport-config');

//connect mongodb Atlas with mongoose
mongoose.connect(
  `mongodb+srv://${process.env.MONGO_ATLAS_USER}:${process.env.MONGO_ATLAS_PW}@free-cluster-penp7.mongodb.net/test?retryWrites=true`,
  { 
    dbName: "btc",
    useNewUrlParser: true
  },
  (err,client) => {
    if(err){ 
      // reconnect with standard string if srv does not work.
      console.log({
        error : err, 
        message: "srv connection did not work ( you may be at a coffeshop or something). reconnecting with standard string..."
      }); 
      mongoose.connect(
        `mongodb://${process.env.MONGO_ATLAS_USER}:${process.env.MONGO_ATLAS_PW}@free-cluster-shard-00-00-penp7.mongodb.net:27017,free-cluster-shard-00-01-penp7.mongodb.net:27017,free-cluster-shard-00-02-penp7.mongodb.net:27017/test?ssl=true&replicaSet=free-cluster-shard-0&authSource=admin&retryWrites=true`,
        { 
          dbName: "btc",
          useNewUrlParser: true
        },
        (err,client) =>{
          if(err) console.log(err + "\nstandard str connection also failed.");
          else console.log("finally connected!");
        }
      );
    }
    else { console.log("connected!"); }
  }
);

// Middlewares
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({
  extended : false
}));
app.use(bodyParser.json());

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));
app.use(passport.initialize());
app.use(passport.session());

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