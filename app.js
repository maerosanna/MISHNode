var express = require('express'),
    bodyParser = require('body-parser'),
    multer = require('multer'),
    mongoose = require('mongoose'),
    app = express(),
    fs = require('fs'),
    gridFS = require('gridfs-stream'),
    credentials = require('./credentials.js'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    userModel = require('./models/UserModel').UserModel;

//Connect to MISH DB
mongoose.connect('mongodb://localhost:27017/mishdb');

var conn = mongoose.connection;
gridFS.mongo = mongoose.mongo;

passport.use(new LocalStrategy(function (username, password, done) {
    userModel.authenticate(username, password, function(err, userObj){
      if (err) {
        return done(err);
      }
      return done(null, userObj);
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  userModel.findById(id, function(err, user) {
    if(err){
      console.log('[app.js] passport.deserializeUser || ERR: ' + err);
    }
    done(err, user);
  });
});

//Configure the application
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(multer()); // for parsing multipart/form-data
app.use(express.static(__dirname + '/public'));
app.use(cookieParser());
app.use(session({secret:credentials.cookieSecret, resave: false, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something broke!' + err.stack);
});


//Configure routes
require('./routes.js')(app);

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