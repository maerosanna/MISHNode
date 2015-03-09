var express = require('express'),
    bodyParser = require('body-parser'),
    multer = require('multer'),
    mongoose = require('mongoose'),
    app = express(),
    fs = require('fs'),
    gridFS = require('gridfs-stream');

//Connect to MISH DB
mongoose.connect('mongodb://localhost:27017/mishdb');

var conn = mongoose.connection;
gridFS.mongo = mongoose.mongo;

//Configure the application
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(multer()); // for parsing multipart/form-data
app.use(express.static(__dirname + '/public'));

//Configure routes
require('./routes.js')(app);

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something broke!' + err.stack);
});

/*
app.listen(process.env.PORT || 3000, process.env.IP, function(){
  if(process.env.PORT){
    console.log('Server up!');
  }else{
    console.log('Server up on port 3000!');
  }
});
*/

//- - - - - - - - - - - - - - - - - - - - - -
//Set server and export module
//- - - - - - - - - - - - - - - - - - - - - -
app.server = require('http').Server(app);
module.exports = app;