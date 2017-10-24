var express = require('express');
var app = express();
var engines = require('consolidate');
var MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser');
var assert = require('assert');

app.engine('html', engines.nunjucks);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use(bodyParser.urlencoded({ extended: true }));

function errorHandler(err, req, res, next) {
  console.error(err.message);
  console.error(err.stack);
  res.status(500).render('error_template', { error: err });
}

MongoClient.connect('mongodb://localhost:27017/video', function(err, db) {
  assert.equal(null, err);
  console.log('Successfully connected to the MongoDB');

  app.get('/', function(req, res) {
    db
      .collection('movies')
      .find({})
      .toArray(function(err, docs) {
        res.render('index', { movies: docs });
      });
  });

  app.post('/add_movie', function(req, res, next) {
    var title = req.body.title;
    var Year = req.body.Year;
    var imdb = req.body.imdb;
    if (typeof title == 'undefined' || typeof Year == 'undefined' || typeof imdb == 'undefined') {
      next('Please fill out all the fields!');
    } else {
      db.collection('movies').insertOne({
        title: title,
        Year: Year,
        imdb: imdb
      });
      res.render('thanks', { body: req.body.title });
    }
  });

  app.use(errorHandler);

  var server = app.listen(3000, function() {
    var port = server.address().port;
    console.log('Epress server listening on port %s.', port);
  });
});
