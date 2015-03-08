var UserModel = require('../models/UserModel').UserModel;

exports.findUser = function(req, res){
  var userData = req.query;
  var query = {
    username: userData.username
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