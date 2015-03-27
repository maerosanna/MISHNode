var UserModel = require('../models/UserModel').UserModel,
    TimelineModel = require('../models/TimelineModel').TimelineModel;

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

exports.findUserDetail = function(req, res){
  var userData = req.query;
  var query = {
    $or:[
      {username: userData.username},
      {email:userData.username}
    ]
  };

  //1. Search the user in database
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

    //return res.status(200).send(userObj);
    //2. If the user exists and the password match, load the user timelines
    //TimelineModel.find({ user: userObj._id }).exec(function(err, userTimelines){
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
};

exports.saveUser = function(req, res){
  var newUser = req.body;
  var userObj = new UserModel(newUser);

  userObj.save(function (err, savedUser) {
    if(err){
      console.log('No se pudo guardar el usuario', err);
      return res.status(400).send(err);
    }

    return res.status(200).send(savedUser);
  });
};