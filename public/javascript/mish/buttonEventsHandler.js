/**
 * Function that assigns listeners for all the buttons in the application.
 *
 * @returns {undefined}
 */
function assignButtonsListeners() {
  //Assign click event for Create User button
  jQuery("#buttCreateUser").click(function () {
    jQuery('#newUserDialog').dialog('open');
    closeMenu();
  });

  //Assign click event for Log In button
  jQuery("#buttLogIn").click(function () {
    jQuery('#logInDialog').dialog('open');
    closeMenu();
  });

  //Assign click event for Log In button
  jQuery("#buttLogOut").click(function () {
    logOutBtnAction();
    closeMenu();
  });

  jQuery(".user_timelines_panel_close").click(function(){
    showTimelinesPanel(false);
    jQuery(".user_timelines_panel").slideUp();
    jQuery("#user_timelines_container").fadeOut();
  });

  jQuery(".user_header").click(function(){
    showTimelinesPanel(true);
  });

  jQuery("#user_timelines_panel_new").click(function(){
    createNewTimeline();
    //loadSamplesClic();
  });

}

/**
 * Function that validates the Log In form and call the database operation that
 * logs the user.
 */
function logInBtnAction() {
  //Hide the showed errors
  showErrorMsg("#errorLogin",false);

  //Boolean that show xor hide the error message
  var showError = false;

  //The ID of the error's container DIV
  var containerDIV = "#logInErrorMsg";

  //Delete the last error message
  clearErrorMessages(containerDIV);

  var username = jQuery("#registeredUserName").val();
  var password = jQuery("#registeredUserPassword").val();

  if (username === ""
    || password === "") {
    appendErrorMessage(containerDIV, "dialog.logIn.error.empty.fields");
    showError = true;
  }

  if (showError) {
    showErrorMsg("#errorLogin",true);
    user_loggedIn = false;
  } else {
    loginUser(username, password, function(err, userObj){
      if(err){
        appendErrorMessage(containerDIV, err.msg);
        showErrorMsg("#errorLogin",true);
        user_loggedIn = false;
        return;
      }

      closeDialog('#logInDialog');
      jQuery("#user_header_button span").text(username);
      jQuery(".user_header").show();
      jQuery(".logout").show();
      jQuery(".login").hide();

      user_loggedIn = true;
      logged_user_id = userObj._id;
      user_timelines = userObj.timelines;

      fillUserTimelinesList();
    });
  }
}

/**
 * Function that validate the creation of a New User and call the database
 * operation function on success.
 *
 * TODO:
 *  - Incluir un campo para el correo electrónico
 *  - Realizar las validaciones de formato para cada campo
 *  - Si se puede, usar un indicador de nivel de seguridad de la contraseña
 *
 */
function createUserBtnAction() {
  //Hide the showed errors
  showErrorMsg("#errorCreateUser",false);

  //Boolean that show xor hide the error message
  var showError = false;

  //The ID of the error's container DIV
  var containerDIV = "#createUserErrorMsg";

  //Delete the last error message
  clearErrorMessages(containerDIV);

  //Create the object with the user data
  var newUserObj = {
    username: jQuery("#userName").val(),
    useremail: jQuery("#userEMail").val(),
    password: jQuery("#userPassword").val()
  };

  //Validate the user name
  if (newUserObj.username !== "") {
    //TODO: Validate format
  } else {
    appendErrorMessage(containerDIV, "dialog.createUser.error.username.empty");
    showError = true;
  }

  //Validate the password
  var passwordConfirm = jQuery("#userPasswordDos").val();
  if (newUserObj.password !== "") {
    //TODO: Validate format

    //Verify if password matches
    if (newUserObj.password !== passwordConfirm) {
      appendErrorMessage(containerDIV, "dialog.createUser.error.password.matches");
      showError = true;
    }
  } else {
    appendErrorMessage(containerDIV, "dialog.createUser.error.password.empty");
    showError = true;
  }

  if (showError) {
    showErrorMsg("#errorCreateUser",true);
  } else {
    createMISHUser(newUserObj, function(err, userId){
      if(err){
        appendErrorMessage(containerDIV, err.msg);
        showErrorMsg("#errorCreateUser",true);
        return;
      }

      user_loggedIn = true;

      jQuery("#user_header_button span").text(newUserObj.username);
      jQuery(".user_header").show();
      jQuery(".logout").show();
      jQuery(".login").hide();

      logged_user_id = userId;
      closeDialog('#newUserDialog');
    });
  }
}

/**
 * Function that logout the user, cleaning all the information.
 */
function logOutBtnAction(){
  //Clear the information of the logged user
  next_user_id = 0;
  user_loggedIn = false;
  user_timelines = null;
  logged_user_id = 0;
  user_timelines_count = 0;

  //Remove the user timelines from the timelines panel
  jQuery(".user_timeline_removable").remove();

  resetTimeruler();

  jQuery("#user_header_button span").text("");
  jQuery(".user_header").hide();
  jQuery(".logout").hide();
  jQuery(".login").show();
  showTimelinesPanel(false);

  user_loggedIn = false;
}

function resetTimeruler(){
  //Restore the timeline ruler and canvas variables to defaults
  center_date = moment();

  mishJsonObjs.timelineJson = null;
  mishJsonObjs.eventsJsonElement = [];

  cellWidth = null;
  mishGA.currentZoomLevel = 6;
  mishGA.currentZoomSubLevel = 2;
  mishGA.zoomData = getZoomData();
  cellWidth = mishGA.zoomData.initialCellWidth;
  drawTimeRuler();
}

function readImageURL(input, callback) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();
    reader.onload = function (e) {
      createImgElementFrom(e.target.result, callback);
    };
    reader.readAsDataURL(input.files[0]);
  }
}

/**
 * Function that validates the fields for Creating a New Event and then
 * proceeds to send the data to the database.
 * 
 */
function createMISHEventBtnAction() {
  //Hide the showed errors
  showErrorMsg("#errorNewEvent",false);

  //Boolean that show xor hide the error message
  var showError = false;

  //The ID of the error's container DIV
  var containerDIV = "#newEventErrorMsg";

  //Delete the last error message
  clearErrorMessages(containerDIV);

  //Create an event object with the info of the new event
  var newEventObj = {
    "title": jQuery("#eventName").val(),
    "description": jQuery("#eventDescription").val(),
    "date": jQuery("#eventDate").val(),
    "time": (moment(jQuery("#eventDate").val(), "DD-MM-YYYY")).valueOf(),
    "image": jQuery("#eventImg").val(),
    "url": jQuery("#eventUrl").val()
  };

  if (newEventObj.title === "") {
    appendErrorMessage(containerDIV, "dialog.createEvent.error.eventName.empty");
    showError = true;
  }

  if (newEventObj.date === "") {
    appendErrorMessage(containerDIV, "dialog.createEvent.error.eventDate.empty");
    showError = true;
  }

  if (showError) {
    showErrorMsg("#errorNewEvent",true);
    user_loggedIn = false;
  } else {
    //Get the ID that the event will have
    var eventsArrayLastPos = mishJsonObjs.eventsJsonElement.length;
    var eventID = (eventsArrayLastPos === 0) ? 1 : mishJsonObjs.eventsJsonElement[eventsArrayLastPos - 1].id + 1;
    newEventObj.id = eventID;

    var imageOfEvent = document.getElementById("eventImg");

    if(imageOfEvent.files && imageOfEvent.files[0]){
      readImageURL(imageOfEvent, function(imageData){
        newEventObj.image = imageData.src;
        newEventObj.imageElement = imageData;
        
        newEventObj.imageName = imageOfEvent.files[0].name;
        
        // newEventObj.imageURL = (window.URL.createObjectURL(imageOfEvent.files[0])).slice(5);
        newEventObj.imageURL = (window.URL.createObjectURL(imageOfEvent.files[0])).split("/");
        newEventObj.imageURL = newEventObj.imageURL[newEventObj.imageURL.length - 1]

        //Add the created event object to the array of events of the timeline
        mishJsonObjs.eventsJsonElement.push(newEventObj);


        saveEventImage(imageOfEvent.files[0]);

      });
    }else{
      mishJsonObjs.eventsJsonElement.push(newEventObj);
    }

    jQuery('#newEventDialog').dialog('close');

  }
}

/**
 * Function that validates the fields for Creating a New Timeline and then
 * proceeds to send the data to the database.
 * 
 */
function createTimelineBtnAction() {
  //Hide the showed errors
  showErrorMsg("#errorSaveTimeline",false);

  //Boolean that show xor hide the error message
  var showError = false;

  //The ID of the error's container DIV
  var containerDIV = "#saveTimelineErrorMsg";

  //Delete the last error message
  clearErrorMessages(containerDIV);

  if (jQuery("#timelineName").val() === "") {
    appendErrorMessage(containerDIV, "dialog.createTimeline.error.timelineName");
    showError = true;
  }

  if (showError) {
    showErrorMsg("#errorSaveTimeline",true);
  } else {
    saveTimeline(function(err, createdTimeline){
      if(err){
        appendErrorMessage(containerDIV, err.msg);
        showErrorMsg("#errorSaveTimeline",true);
        return;
      }

      showAlertMessage("dialog.createTimeline.timeline.saved");
      jQuery('#newTimelineDialog').dialog('close');

    });
  }
}

/**
 * Function that saves the changes made in the timeline when it exists.
 * If the timeline doesn't exists, then it attempts to create it. But, if the
 * user isn't logged, then the function opens the dialog for creating a user, and,
 * after its creation the timeline is saved.
 * 
 */
function saveTimelineBtnAction() {
  if (user_loggedIn) {
    jQuery("#newTimelineDialog").dialog('open');
  }
  else {
    jQuery("#buttCreateUser").click();
  }
}

function createNewTimeline() {
  resetTimeruler();
  showTimelinesPanel(false);
}

function closeMenu() {
  jQuery("#canvasContextMenu").hide();
  jQuery("#canvasContextMenu").css('left', 0);
  jQuery("#canvasContextMenu").css('top', 0);
}