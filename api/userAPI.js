var UserModel = require('../models/UserModel').UserModel,
    TimelineModel = require('../models/TimelineModel').TimelineModel,
    passport = require('passport');

exports.findUser = function(req, res){
  var userData = req.query;
  var query = {
    $or:[
      {username: userData.username},
      {email:userData.username}
    ]
  };

  UserModel.findOne(query).exec(function(err, userObj){
    if(err){
      return res.status(400).send({code:'error.operation'});
    }

    if(!userObj){
      return res.status(400).send({code:'dialog.logIn.error.user.notfound'});
    }

    if(userObj.password !== userData.password){
      return res.status(400).send({code:'dialog.logIn.error.user.wrong.password'});
    }

    return res.status(200).send(userObj);
  });
};

exports.findUserDetail = function(req, res, next){
  var userData = req.query;

  passport.authenticate('local', function(err, userObj) {
    if(err){
      return res.status(400).send(err);
    }

    if(!userObj){
      console.log("CACALISA");
      //  return res.status(400).send({code:'dialog.logIn.error.user.notfound'});
    }

    req.logIn(userObj, function(err) {
      if(err){
        console.log("[userAPI.js] : error in req.logIn");
        return res.status(400).send({code:'error.operation'});
      }

      //Load the user timelines
      TimelineModel.find({ user: userObj._id }).populate('events').exec(function(err, userTimelines){
        if(err){
          return res.status(400).send({code:'error.operation'});
        }

        var userDetail = {
          user: userObj,
          timelines: userTimelines
        };

        return res.status(200).send(userDetail);
      });

    });
  })(req, res, next);
};

exports.logoutUser = function(req, res){
  if(req.isAuthenticated()){
    req.logout();
  }
  res.redirect('/');
};

exports.findUserSession = function(req, res){
  if(req.isAuthenticated()){
    //Load the user timelines
    TimelineModel.find({ user: req.user._id }).populate('events').exec(function(err, userTimelines){
      if(err){
        return res.status(400).send({code:'error.operation'});
      }

      var userDetail = {
        user: req.user,
        timelines: userTimelines
      };

      return res.status(200).send(userDetail);
    });
  }else{
    res.status(200).send({});
  }
};

exports.saveUser = function(req, res, next){
  var newUser = req.body;
  var userObj = new UserModel(newUser);

  userObj.save(function (err, savedUser) {
    if(err){
      console.log('No se pudo guardar el usuario', err);
      return res.status(400).send(err);
    }

    passport.authenticate('local', function(err, userObj) {
      if(err){
        return res.status(400).send(err);
      }

      req.logIn(userObj, function(err){
        if(err){
          return res.status(400).send(err);
        }

        return res.status(200).send(savedUser);
      });
      
    })(req, res, next);

  });


};