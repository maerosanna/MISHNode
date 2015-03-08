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
 * VIRTUALS
 * --------------------------------------------------
 */

/*
UserSchema.virtual('timelines').get(function(){
  return this.timelines;
});

UserSchema.virtual('timelines').set(function(_timelines){
  this.timelines = _timelines;
});
*/

/*
UserSchema.virtual('timelines').get(function(){
  return this.timelines;
}).set(function(timelines){
  this.timelines = timelines;
});
*/

/**
 * --------------------------------------------------
 * MODEL CONFIGURATION
 * --------------------------------------------------
 */
//  UserSchema.set('toJSON', { virtuals: true });

/**
 * --------------------------------------------------
 * MONGOOSE MODEL CREATION AND EXPORTATION
 * --------------------------------------------------
 */
exports.UserModel = mongoose.model('User', UserSchema);