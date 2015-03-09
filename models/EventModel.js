//  http://excellencenodejsblog.com/gridfs-using-mongoose-nodejs/
//  https://github.com/aheckmann/gridfs-stream
//  http://blog.robertonodi.me/managing-files-with-node-js-and-mongodb-gridfs/   [!]

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    fs = require('fs'),
    path = require('path'),
    gridFS = require('gridfs-stream');

/**
 * EVENT model:
 *  - title: The title of the event
 *  - description: The description of the event
 *  - date: The date of the event
 *  - time: The date of the event in "DD-MM-YYYY" format
 *  - image: The image of the event
 *  - url: A link with information related to the event
 */
var EventSchema = new Schema({
  title: { type: String },
  description: { type: String },
  date: { type: Date },
  time: { type: Number },
  image: { type: Schema.Types.ObjectId },
  imageName: { type: String },
  imageURL: { type: String },
  url: { type: String }
});

/**
 * --------------------------------------------------
 * PRE
 * --------------------------------------------------
 */

EventSchema.pre('save', function(next, done){
  var _me = this;
  var gfs = gridFS(mongoose.connection.db);
  var writestream = gfs.createWriteStream({
    filename: _me.imageName
  });

  fs.createReadStream(_me.imageURL).pipe(writestream);
  writestream.on('close', function (file) {
    _me.image = file._id;
    _me.imageURL = undefined;
    _me.imageName = undefined;

    return next();
  });
});

/**
 * --------------------------------------------------
 * MONGOOSE MODEL CREATION AND EXPORTATION
 * --------------------------------------------------
 */
exports.EventModel = mongoose.model('Event', EventSchema);