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

/**
 * --------------------------------------------------
 * MONGOOSE MODEL CREATION AND EXPORTATION
 * --------------------------------------------------
 */
exports.UserModel = mongoose.model('User', UserSchema);