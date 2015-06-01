var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * USER model:
 *  - username: The unique username
 *  - email: The eMail of the user
 *  - password: The password of the user
 */
var UserSchema = new Schema({
  username: { type: String, unique: true, lowercase: true, trim: true, sparse:true },
  email: { type: String, unique: true, sparse: true },
  password: { type:String }
});

UserSchema.statics.authenticate = function(username, password, callback) {
  var query = {
    $or:[
      {username: username},
      {email: username}
    ]
  };

  this.findOne(query).exec(function(err, userObj){
    if(err){
      return callback({code:'error.operation'});
    }

    if(!userObj){
      return callback({code:'dialog.logIn.error.user.notfound'});
    }

    if(userObj.password !== password){
      return callback({code:'dialog.logIn.error.user.wrong.password'});
    }

    return callback(null, userObj);
  });
};

/**
 * --------------------------------------------------
 * MONGOOSE MODEL CREATION AND EXPORTATION
 * --------------------------------------------------
 */
exports.UserModel = mongoose.model('User', UserSchema);