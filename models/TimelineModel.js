var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = require('mongoose').Types.ObjectId;

/**
 * TIMELINE model:
 *  - name: The unique username
 *  - colorScheme: The eMail of the user
 *  - user: The user to which this timeline belongs
 *  - creationDate: The date of creation
 *  - centerDate: The center date for the timeline
 *  - zoomLevel: The initial level of zoom to use when the timeline is loaded
 *  - zoomSubLevel: The initial sub level of zoom to use when the timeline is loaded
 *  - events: The array of events (model EVENT) of the timeline
 */
var TimelineSchema = new Schema({
  name: { type: String },
  colorScheme: { type: String },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  creationDate: { type: Date },
  centerDate: { type: Date },
  zoomLevel: { type: Number },
  zoomSubLevel: { type: Number },
  events: [{ type: Schema.Types.ObjectId, ref: 'Event' }],
});


/**
 * --------------------------------------------------
 * STATICS
 * --------------------------------------------------
 */


TimelineSchema.statics.updateTimeline = function(timelineId, newTimelineData, callback) {
  var dataToUpdate = {};
  if(newTimelineData.eventsToAdd){
    dataToUpdate.$addToSet = {
      events:{
        $each: newTimelineData.eventsToAdd 
      }
    };
  }

  if(newTimelineData.eventsToDelete){
    dataToUpdate.$pullAll = {
      events: []
    };
    newTimelineData.eventsToDelete.forEach(function(eventId){
      dataToUpdate.$pullAll.events.push(eventId);
    });
  }

  if(newTimelineData.centerDate){
    dataToUpdate.$set = {
      centerDate: newTimelineData.centerDate
    };
  }

  this.findOneAndUpdate(query, dataToUpdate, function(err, timelineUpdatedObj){
      if(err){
        console.log("ERROR: DB operation in TimelineSchema.statics.updateTimeline\n", err);
        return callback({message:"ERROR IN OPERATION"}, null);
      }

      if(!timelineUpdatedObj){
        console.log("ERROR: No timeline in DB for the id " + timelineId);
        return callback({message:"ERROR TIMELINE NOT FOUND"}, null);
      }

      callback(null, timelineUpdatedObj);
      return;
    }
  );
};


/**
 * --------------------------------------------------
 * MONGOOSE MODEL CREATION AND EXPORTATION
 * --------------------------------------------------
 */
exports.TimelineModel = mongoose.model('Timeline', TimelineSchema);