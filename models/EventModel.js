var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

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
  image: { type: String },
  url: { type: String }
});

/**
 * --------------------------------------------------
 * MONGOOSE MODEL CREATION AND EXPORTATION
 * --------------------------------------------------
 */
exports.EventModel = mongoose.model('Event', EventSchema);