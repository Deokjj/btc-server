const express = require('express');
const app = express();

const testRoute = require('./api/routes/test');

app.use('/test', testRoute);

module.exports = app;