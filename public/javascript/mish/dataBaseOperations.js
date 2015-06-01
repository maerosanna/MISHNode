/**
 * Function that looks for a user in the database and begins its session when it is found.
 * 
 * @param {string} username
 * @param {string} password
 * @param {function(err,obj)} callback
 */
function loginUser(username, password, callback){
  var userData = {
    "username": username,
    "password": password
  };

  var errObj = {msg:''};

  jQuery.ajax({
    "url": "/userDetail",
    "type": "GET",
    "data": userData,
    "dataType": "JSON"
  }).done(function (data){
    if (!data || !data.user) {
      errObj.msg = "error.operation";
      return callback(errObj, null);
    }

    var userObj = data.user;
    userObj.timelines = data.timelines;

    callback(null, userObj);
  }).fail(function(err){
    errObj.msg = "error.operation";
    if(err.responseJSON && err.responseJSON.code){
      errObj.msg = err.responseJSON.code;
    }

    callback(errObj, null);
  });
}

function logoutUser(){
  var errObj = {msg:''};

  jQuery.ajax({
    "url": "/userLogout",
    "type": "GET"
  }).done(function (data){
  }).fail(function(err){
  });
}

/**
 * Function that looks if there is an opened session for the user.
 * 
 */
function autoLogin(callback){
  var errObj = {msg:''};

  jQuery.ajax({
    "url": "/userAuth",
    "type": "GET",
    "dataType": "JSON"
  }).done(function (data){
    if (!data || !data.user) {
      return callback(null, null);
    }

    var userObj = data.user;
    userObj.timelines = data.timelines;

    callback(null, userObj);
  }).fail(function(err){
    errObj.msg = "error.operation";
    if(err.responseJSON && err.responseJSON.code){
      errObj.msg = err.responseJSON.code;
    }

    callback(errObj, null);
  });
}

/**
 * Function that creates a new user and save it in database.
 * 
 * @param {object} password
 * @param {function(err,obj)} callback
 */
function createMISHUser(userData, callback){
  //1. Create the object with the information of the new user to create
  var newUserObj = {
    "username": userData.username,
    "email": userData.useremail,
    "password": userData.password
  };

  var errObj = {msg:''};

  //2. Send the object created to database
  jQuery.ajax({
    "url": "/user",
    "type": "POST",
    "data": newUserObj,
    "dataType": "JSON"
  }).done(function (data) {
    if(!data._id){
      errObj.msg = "dialog.createUser.error.user.creation";
      callback(errObj,null);
      return;
    }

    callback(null,data._id);
  }).fail(function(err){
    errObj.msg = "error.operation";
    if(err.responseJSON && err.responseJSON.code === 11000){
      errObj.msg = "dialog.createUser.error.user.duplicate";
    }
    callback(errObj,null);
  });
}

/**
 * Function that save the current timeline in database.
 * 
 * @param {function(err,object)} callback
 */
function saveTimeline(callback) {
  if (user_loggedIn) {
    var errObj = {msg:''};

    //1. Find the center date of all the events of the current timeline
    var centerDate = findCenterDate();

    if (supermish.timelineEvents && supermish.timelineEvents.length > 0) {

      //1. Save the events in database for getting the _ID of each one
      saveTimelineEvents(supermish.timelineEvents, function(err, savedEvents){
        if(err){
          errObj.msg = "error.operation";
          return callback(errObj,null);
        }

        //2. Create the object to save in database
        var newTimeline = {
          "name": jQuery("#timelineName").val(),
          "colorScheme": "01",//@todo Implement this
          "user": logged_user_id,
          "creationDate": moment().format('MM-DD-YYYY'),
          "centerDate": moment(centerDate, 'DD-MM-YYYY').format('MM-DD-YYYY'),
          "zoomLevel": mishGA.currentZoomLevel,
          "zoomSubLevel": mishGA.currentZoomSubLevel,
          "events": [],
          "user": logged_user_id
        };

        //2.1 Assign the _IDs of the events to create
        savedEvents.forEach(function(eventObj){
          newTimeline.events.push(eventObj._id);

          //Search the event in the array of events of the application and set
          //its created _ID
          for (var i = 0; i < supermish.timelineEvents.length; i++) {
            if(!supermish.timelineEvents[i].storeableData._id
                && supermish.timelineEvents[i].storeableData.title === eventObj.title
                && supermish.timelineEvents[i].storeableData.time === eventObj.time){
              supermish.timelineEvents[i].storeableData._id = eventObj._id;
              break;
            }
          }
        });

        //3. Send the object to database
        jQuery.ajax({
          "url": "/timeline",
          "type": "POST",
          "data": newTimeline,
          "dataType": "JSON"
        }).done(function (data) {
          if(!data){
            errObj.msg = "error.operation";
            return callback(errObj,null);
          }

          data.events = savedEvents;

          return callback(null, data);
        }).fail(function(err){
          errObj.msg = "error.operation";
          if(err.responseJSON && err.responseJSON.code){
            errObj.msg = err.responseJSON.code;
          }
          callback(errObj,null);
        });

      });

    }else {
      errObj.msg = "dialog.createTimeline.error.noEvents";
      callback(errObj,null);
    }
  }
}

/**
 * Function that updates the current timeline.
 * This function only send the request to the server if the
 * timeline has new events, deleted events or updated events.
 * 
 * @param  {Function} callback The function to call after completing this operation
 */
function updateTimeline(){
  var errObj = {msg:''};

  //Verify if the events in the timeline has changed
  var eventsToCreate = [];
  var eventsToUpdate = [];
  var eventsToDelete = [];
  var operationsToEject = 0;
  var ejectedOperations = 0;
  var addedEvents = [];

  if(supermish.timelineEvents && supermish.timelineEvents.length > 0){
    supermish.timelineEvents.forEach(function(eventObj){
      if(!eventObj.storeableData._id){
        //The event doesn't have an _ID attribute. This is a new event in the timeline so....
        eventsToCreate.push(eventObj);
      }else{
        if(eventObj.storeableData.updated === true){
          eventsToUpdate.push(eventObj);
        }

        if(eventObj.storeableData.deleted === true){
          eventsToDelete.push(eventObj);
        }
      }
    });
  }

  eventsToDelete = eventsToDelete.concat(supermish.eventsToDelete);

  if(eventsToCreate.length > 0){
    operationsToEject++;
  }

  if(eventsToUpdate.length > 0){
    operationsToEject++;
  }

  if(eventsToDelete.length > 0){
    operationsToEject++;
  }

  if(operationsToEject === 0){
    showAlertMessage(false, "dialog.createTimeline.timeline.noChanges");
    return;
  }

  //Save the changes in the events of the timeline
  saveEventsChanges(eventsToCreate, eventsToUpdate, eventsToDelete, function(err, updatedTimeline, operationData){
    if(err){
      showAlertMessage(true, err.msg);
    }else{
      if(operationData.toAdd){
        addedEvents = operationData.toAdd;
      }
    }

    ejectedOperations++;

    if(ejectedOperations >= operationsToEject){
      //All operations were completed, update the timeline object in the database
      supermish.eventsToDelete = [];

      //Update the timeline object in database
      var centerDate = findCenterDate();
      var timelineToUpdate = {
        _id: mishJsonObjs.timelineJson._id,
        events: [],
        centerDate: moment(centerDate, 'DD-MM-YYYY').format('MM-DD-YYYY')
      };

      //Assign the _IDs of the events to create
      if(addedEvents.length > 0){
        //Search the event in the array of events of the application and set
        //its created _ID
        addedEvents.forEach(function(eventObj){
          for (var i = 0; i < supermish.timelineEvents.length; i++) {
            if(!supermish.timelineEvents[i].storeableData._id
                && supermish.timelineEvents[i].storeableData.title === eventObj.title
                && supermish.timelineEvents[i].storeableData.time === eventObj.time){
              supermish.timelineEvents[i].storeableData._id = eventObj._id;
              break;
            }
          }
        });
      }

      //Assign the _IDs of the events to set in the timeline
      supermish.timelineEvents.forEach(function(eventObj){
        timelineToUpdate.events.push(eventObj.storeableData._id);
      });

      //Send the timeline object to database
      jQuery.ajax({
        "url": "/timeline",
        "type": "PUT",
        "data": timelineToUpdate,
        "dataType": "JSON"
      }).done(function (timelineObjUpdated) {
        if(!timelineObjUpdated){
          showAlertMessage(false, "error.operation");
          return;
        }

        //Update the timeline in the application
        var timelineIndex = mishJsonObjs.timelineJson.index;
        user_timelines[timelineIndex] = timelineObjUpdated;
        
        //Set the events in the format generated by the database
        user_timelines[timelineIndex].events = [];
        supermish.timelineEvents.forEach(function(eventObj, index){
          var eventCloned = cloneObj(eventObj.storeableData);
          eventCloned.date = new Date((moment(eventCloned.date, 'DD-MM-YYYY')).valueOf());
          user_timelines[timelineIndex].events.push(eventCloned);
        });

        updateCenterDateDiv();
        showAlertMessage(false, "dialog.createTimeline.timeline.saved", ": " + timelineObjUpdated.name);

        return;
      }).fail(function(err){
        errObj.msg = "error.operation";
        if(err.responseJSON && err.responseJSON.code){
          errObj.msg = err.responseJSON.code;
        }

        return showAlertMessage(true, errObj.msg);
      });

    }
  });
}

/**
 * Function that saves, updates and deletes, in database, the events in the current timeline.
 * 
 * @param  {Function} callback  The function to call after completing each operation.
 */
function saveEventsChanges(eventsToCreate, eventsToUpdate, eventsToDelete, callback){
  var errObj = {msg:''};

  //1. Add the new events to the database
  if(eventsToCreate.length > 0){
    saveTimelineEvents(eventsToCreate, function(err, savedEvents){
      if(err){
        errObj.msg = "error.operation";
        return callback(errObj, null, null);
      }

      return callback(null, null, {"toAdd": savedEvents});
    });
  }

  //2. Update the modified events in the database
  if(eventsToUpdate.length > 0){
    updateTimelineEvents(eventsToUpdate, function(err, updatedEvents){
      if(err){
        errObj.msg = "error.operation";
        return callback(errObj, null);
      }

      return callback(null, null, {});
    });
  }

  //3. Delete the events marked as "deleted" from the DB
  if(eventsToDelete.length > 0){
    deleteTimelineEvents(eventsToDelete, function(err, deletedEvents){
      if(err){
        errObj.msg = "error.operation";
        return callback(errObj, null);
      }

      return callback(null, null, {"toDelete": deletedEvents});
    });
  }
}

/**
 * Function that saves in database the events associated to the current timeline.
 * 
 * @param  {array}        The array of events to save
 * @param  {Function}     The function to call after complete the operation
 */
function saveTimelineEvents(events, callback){
  showLoadingAnimation(true);

  var errObj = {msg:''};

  var data = new FormData();
  events.forEach(function(eventObj, index){
    var eventCloned = cloneObj(eventObj.storeableData);

    //Append the data of the event
    data.append('event_' + index, "" + 
      eventCloned.title + ":|@" +
      (eventCloned.description || "") + ":|@" +
      (moment(eventCloned.date, 'DD-MM-YYYY')).valueOf() + ":|@" +
      eventCloned.time + ":|@" +
      (eventCloned.url || "") + ":|@"
    );

    //Append the image of the event
    data.append('event_' + index, eventCloned.image);
  });

  jQuery.ajax({
    url: '/events',
    data: data,
    type: 'POST',
    cache: false,
    contentType: false,
    processData: false
  }).done(function (data) {
    showLoadingAnimation(false);

    if(!data){
      errObj.msg = "error.operation";
      return callback(errObj, null);
    }

    return callback(null, data);
  }).fail(function(err){
    showLoadingAnimation(false);

    errObj.msg = "error.operation";
    if(err.responseJSON && err.responseJSON.code){
      errObj.msg = err.responseJSON.code;
    }

    callback(errObj, null);
  });

}

/**
 * Function that updates in database the modified events in the current timeline.
 * 
 * @param  {array}        The array of events to update
 * @param  {Function}     The function to call after complete the operation
 */
function updateTimelineEvents(events, callback){
  showLoadingAnimation(true);

  var errObj = {msg:''};

  var data = new FormData();
  events.forEach(function(eventObj, index){
    var eventCloned = cloneObj(eventObj.storeableData);

    //Append the data of the event
    data.append('event_' + eventObj.storeableData._id, "" + 
      eventCloned.title + ":|@" +
      (eventCloned.description || "") + ":|@" +
      (moment(eventCloned.date, 'DD-MM-YYYY')).valueOf() + ":|@" +
      eventCloned.time + ":|@" +
      (eventCloned.url || "") + ":|@"
    );

    //Append the image of the event
    //  data.append('event_' + eventObj.storeableData._id, eventCloned.image);
  });

  jQuery.ajax({
    url: '/events',
    data: data,
    type: 'PUT',
    cache: false,
    contentType: false,
    processData: false
  }).done(function (data) {
    showLoadingAnimation(false);

    if(!data){
      errObj.msg = "error.operation";
      return callback(errObj, null);
    }

    return callback(null, data);
  }).fail(function(err){
    showLoadingAnimation(false);

    errObj.msg = "error.operation";
    if(err.responseJSON && err.responseJSON.code){
      errObj.msg = err.responseJSON.code;
    }

    callback(errObj, null);
  });
}

/**
 * Function that deletes from database the deleted events in 
 * the current timeline.
 * 
 * @param  {array}   events      The Array of events to delete in DB
 * @param  {Function} callback   The function to call after completing the deletion task
 */
function deleteTimelineEvents(events, callback){
  showLoadingAnimation(true);

  var errObj = {msg:''};

  var eventsToDelete = [];
  events.forEach(function(eventObj){
    eventsToDelete.push(eventObj.storeableData._id);
  });

  jQuery.ajax({
    url: '/events',
    data: {eventsId: eventsToDelete},
    type: 'DELETE'
  }).done(function (data) {
    showLoadingAnimation(false);

    if(!data){
      errObj.msg = "error.operation";
      return callback(errObj, null);
    }

    return callback(null, data);
  }).fail(function(err){
    showLoadingAnimation(false);

    errObj.msg = "error.operation";
    if(err.responseJSON && err.responseJSON.code){
      errObj.msg = err.responseJSON.code;
    }

    callback(errObj, null);
  });
}

/**
 * Function the loads the timelines of the received user.
 * 
 * @param  {string}   userId   The _ID of the user
 * @param  {Function} callback The function to call after request completion
 * 
 */
function loadUserTimelines(userId, callback){
  showLoadingAnimation(true);
  var errObj = {msg:''};

  jQuery.ajax({
    "url": "/user",
    "type": "GET",
    "data": userId,
    "dataType": "JSON"
  }).done(function (data){
    showLoadingAnimation(false);

    if (!data || !data._id) {
      errObj.msg = "error.operation";
      return callback(errObj,null);
    }

    callback(null,data);
  }).fail(function(err){
    showLoadingAnimation(false);

    errObj.msg = "error.operation";
    if(err.responseJSON && err.responseJSON.code){
      errObj.msg = err.responseJSON.code;
    }

    callback(errObj,null);
  });
}

/**
 * Function that get the image of the received event
 * @param  {string}   eventId    The _ID of the event
 * @param  {number}   eventIndex The event position in the "supermish.timelineEvents" array
 * @param  {Function} callback   The function to call after completing the request
 * 
 */
function getEventImage(eventId, eventIndex, callback){
  var eventData = {
    "eventId": eventId,
    "eventIndex": eventIndex
  };

  var errObj = {msg:''};

  jQuery.ajax({
    "url": "/eventImage",
    "type": "GET",
    "data": eventData
  }).done(function (data){
    if (!data) {
      errObj.msg = "error.operation";
      return callback(errObj, null);
    }

    callback(null, data.eventIndex, data.eventImage);

  }).fail(function(err){
    errObj.msg = "error.operation";
    if(err.responseJSON && err.responseJSON.code){
      errObj.msg = err.responseJSON.code;
    }

    callback(errObj, null);
  });
}

/**
 * Function that reads the color schemes available in database.
 * @todo Change the implementation for read a JSON file instead of a XML file.
 */
function readColorSchemeXML() {
  jQuery.ajax({
    type: "GET",
    url: "color_schemes.xml",
    dataType: "xml",
    contentType: "application/x-www-form-urlencoded; charset=UTF-8",
    success: colorSchemeXMLSuccessRead,
    error: colorSchemeXMLReadError
  });
}
function colorSchemeXMLSuccessRead(xml) {
  jQuery(xml).find("color_schemes color_scheme[id|=" + colorsch_id + "]").each(function () {
    jQuery(this).children().each(function () {
      timeline_color_scheme [timeline_color_scheme.length] = jQuery(this).text();
    });
  });
}
function colorSchemeXMLReadError() {
  confirm("Hubo un error al intentar cargar el archivo XML para el color scheme");
}