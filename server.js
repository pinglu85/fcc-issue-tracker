'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const apiRoutes = require('./routes/api.js');
const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner');

const app = express();

app.use(helmet.xssFilter());

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({ origin: '*' })); //For FCC testing purposes only

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Sample front-end
app.route('/:project/').get(function (req, res) {
  res.sendFile(process.cwd() + '/views/issue.html');
});

//Index page (static HTML)
app.route('/').get(function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

//For FCC testing purposes
fccTestingRoutes(app);

MongoClient.connect(
  process.env.MONGO_URI,
  { useUnifiedTopology: true },
  (error, client) => {
    assert.equal(null, error);

    const dbName = 'test';
    const db = client.db(dbName);

    //Routing for API
    apiRoutes(app, db);

    //404 Not Found Middleware
    app.use((req, res, next) => {
      return next({ status: 404, message: 'not found' });
    });

    // Error handling
    app.use((err, req, res, next) => {
      const errCode = err.status || 500;
      const errMessage = err.message || 'Internal Server Error';
      res.status(errCode).type('application/json').json({ error: errMessage });
    });

    //Start our server and tests!
    app.listen(process.env.PORT || 3000, function () {
      console.log('Listening on port ' + process.env.PORT);
      if (process.env.NODE_ENV === 'test') {
        console.log('Running Tests...');
        setTimeout(function () {
          try {
            runner.run();
          } catch (e) {
            const error = e;
            console.log('Tests are not valid:');
            console.log(error);
          }
        }, 3500);
      }
      app.emit('ready');
    });
  }
);

module.exports = app; //for testing
