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

    if (centerDate != null) {

      //1. Save the events in database for getting the _ID of each one
      saveTimelineEvents(mishJsonObjs.eventsJsonElement, function(err, savedEvents){
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

          return callback(null, data);
        }).fail(function(err){
          errObj.msg = "error.operation";
          if(err.responseJSON && err.responseJSON.code){
            errObj.msg = err.responseJSON.code;
          }
          callback(errObj,null);
        });

      });


    } else {
      errObj.msg = "dialog.createTimeline.error.noEvents";
      callback(errObj,null);
    }
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
    var eventCloned = cloneObj(eventObj);

    //Append the data of the event
    data.append('event_' + index, "" + 
      eventCloned.title + ":|@" +
      eventCloned.description || "" + ":|@" +
      (moment(eventCloned.date, 'DD-MM-YYYY')).valueOf() + ":|@" +
      eventCloned.time + ":|@" +
      eventCloned.url || "" + ":|@"
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
      return callback(errObj,null);
    }

    return callback(null, data);
  }).fail(function(err){
    showLoadingAnimation(false);

    errObj.msg = "error.operation";
    if(err.responseJSON && err.responseJSON.code){
      errObj.msg = err.responseJSON.code;
    }
    callback(errObj,null);
  });;


  /*

  var eventsToSend = [];

  events.forEach(function(eventObj){
    var eventCloned = cloneObj(eventObj);

    //Modify and remove elements on the clone to send to the database
    eventCloned.date = (moment(eventCloned.date, 'DD-MM-YYYY')).valueOf();
    eventCloned.imageElement = null;

    eventsToSend.push(eventCloned);
  });

  //1. Send the array of events to the database
  jQuery.ajax({
    "url": "/events",
    "type": "POST",
    "data": {
      "events": eventsToSend
    },
    "dataType": "JSON"
  }).done(function (data) {
    if(!data){
      errObj.msg = "error.operation";
      return callback(errObj,null);
    }

    return callback(null, data);
  }).fail(function(err){
    errObj.msg = "error.operation";
    if(err.responseJSON && err.responseJSON.code){
      errObj.msg = err.responseJSON.code;
    }
    callback(errObj,null);
  });

  */

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
 * @param  {number}   eventIndex The event position in the "mishJsonObjs.eventsJsonElement" array
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
    console.log("||||||||||||||||||||");
    console.log(err);


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