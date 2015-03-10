//  http://excellencenodejsblog.com/gridfs-using-mongoose-nodejs/
//  https://github.com/aheckmann/gridfs-stream
//  http://blog.robertonodi.me/managing-files-with-node-js-and-mongodb-gridfs/   [!]

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    fs = require('fs'),
    path = require('path'),
    gridFS = require('gridfs-stream'),
    Binary = mongoose.mongo.Binary,
    GridStore = mongoose.mongo.GridStore,
    ObjectId = require('mongoose').Types.ObjectId;

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
  imageURL: { type: String },
  imageName: { type: String },
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
 * STATICS
 * --------------------------------------------------
 */

/**
 * Method that get the image related to an event.
 * 
 * @param  {[type]}   eventId  [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
EventSchema.statics.findEventImage = function(eventId, response, callback) {
  var query = {_id: new ObjectId(eventId)};
  this.findOne(query).exec(function(err, eventObj){
    if(err){
      return callback({message:"ERROR IN OPERATION"}, null);
    }

    if(!eventObj){
      console.log("ERROR: No event in DB for the id " + eventId);
      return callback({message:"ERROR EVENT NOT FOUND"}, null);
    }

    var gridStore = new GridStore(mongoose.connection.db, new ObjectId(eventObj.image), 'r');
    gridStore.open(function (err, gridStore) {
        //console.log(gridStore.currentChunk.data.buffer);
        gridStore.read(function (error,data){
            callback(null, data);
            //res.writeHead(200, {'Content-Type': 'image/png'});
            //var s = gridStore.stream(true);
            //console.log(s);
        });
    });


    /*
    
    if(eventObj.image){
      var imageData;
      
      // var fs_write_stream = fs.createWriteStream('write.png');

      var gfs = gridFS(mongoose.connection.db);
      var readstream = gfs.createReadStream({_id: eventObj.image}, {encoding:'base64'});
      response.setHeader('Content-Type', 'text/html; charset=UTF-8');
      readstream.pipe(response);

      readstream.on('end', function () {
        console.log("- - - - - - TERMINADO - - - - - - ");
      });
    }else{
      return callback(null, null);
    }

    */

  });
};

/**
 * --------------------------------------------------
 * MONGOOSE MODEL CREATION AND EXPORTATION
 * --------------------------------------------------
 */
exports.EventModel = mongoose.model('Event', EventSchema);