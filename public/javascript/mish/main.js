/**
 * Mish main object.
 * 
 * @type {[type]}
 */
var Mish = Mish || {};
var test = false;
Mish = function(){
  this.timelineEvents = [];
  this.renderer = null;
  this.eventToUpdate = null;
  this.eventToDelete = null;
  this.eventsToDelete = [];
};

Mish.prototype.constructor = Mish;

Mish.prototype.get = function(attr){
  return this[attr];
};

Mish.prototype.set = function(attr, value){
  this[attr] = value;
};

Mish.prototype.init = function(){};

Mish.prototype.pushEvent = function(eventToPush){
  //Push the event
  this.timelineEvents.push(eventToPush);

  //Sort the array of events
  this.sortEvents();
};

Mish.prototype.sortEvents = function(){
  //Sort the array of events by time
  this.timelineEvents.sort(function(a, b){
    return a.storeableData.time - b.storeableData.time;
  });

  //Assign the position to each event
  this.timelineEvents.forEach(function(eventObj, index){
    eventObj.positionRelativeToEvents = index;
  });
};

Mish.prototype.clearEvents = function(){
  this.timelineEvents.forEach(function(eventObj){
    if(eventObj.detailElement){
      eventObj.detailElement.hide("fade");
    }
  });
  this.timelineEvents = [];
};

/*
--------------------------------
MISH Global Attributes
 --------------------------------
 */
var mishGA = {
  canvasObject: null,
  workAreaWidth: jQuery(window).width(),
  workAreaHeight: jQuery(window).height(),
  workAreaWidthHalf: this.workAreaWidth / 2,
  timeRulerGroups: [],
  timeRulerXPos: 0,
  /*Attributes for zoom control*/
  currentZoomLevel: 6,
  currentZoomSubLevel: 2,
  zoomData: null,
  lastZoomLevelName: null,
  renderer: null,
  stage: null
};

/**
 * Object that will contain elements related with the JSON operations.
 */
var mishJsonObjs = {
  timelineJson: null,
  eventsJsonElement: []
};

var msg;

/*Attributes for styles*/
var centerDateCssClass;
var separatorDateCssClass;
var normalDateCssClass;

var timeline_color_scheme;
var colorsch_id;
var globalPosX;
var globalPosY;
var zoom_level;
var cellWidth;
var zoom_local;
var center_date;
var next_user_id;
var user_timelines;
var user_loggedIn;
var logged_user_id;
var user_timelines_count;
var showing_alert_message;



var supermish = null;

/**
 * Function that assigns the initial values for all the global variables.
 *
 * @returns {undefined}
 */
function initAttr() {
  //Set the location of MomentJS
  moment.locale('es');

  supermish = new Mish();

  //Get the size for the work area
  mishGA.workAreaWidth = jQuery(window).width();
  mishGA.workAreaHeight = jQuery(window).height();

  //Assign the object with all the application's messages
  msg = messagesObject.msg;//The way to read a message: msg["error.inicioSesion"]

  //Get the cell width for the initial zoom level
  mishGA.zoomData = getZoomData();
  cellWidth = mishGA.zoomData.initialCellWidth;

  timeline_color_scheme = new Array();
  zoom_level = 0;
  center_date = moment();
  next_user_id = 0;
  user_timelines = null;
  user_loggedIn = false;
  globalPosX = 0;
  globalPosY = 80;
  logged_user_id = 0;
  user_timelines_count = 0;
  showing_alert_message = false;

  initStyleVars();
}

/**
 * Function that defines the classes and styles to use.
 *
 * @returns {undefined}
 */
function initStyleVars() {
  centerDateCssClass = "centerDate";
  separatorDateCssClass = "separatorDate";
  normalDateCssClass = "normalDate";
}

/*
 * Main function
 */
jQuery(document).ready(function () {
  initAttr();
  resizeContainers();

  //Load all the external pages
  loadExternalPages();

  //Assign listeners
  assignButtonsListeners();
  assignMouseEventsListeners();

  //Draw the basis time ruler
  drawTimeRuler();
  
  //Create the renderer
  createRenderer();

  //Verify if there is an opened session
  autoLogin(function(err, userObj){
    if(err){
      showAlertMessage(true, "autoLogin.error");
      user_loggedIn = false;
      return;
    }

    if(!userObj){
      return;
    }

    showAlertMessage(false, "autoLogin.success", {username: userObj.username});

    jQuery("#user_header_button span").text(msg["myAccount.title"]);
    jQuery(".user_header").show();
    jQuery(".logout").show();
    jQuery(".login").hide();

    user_loggedIn = true;
    logged_user_id = userObj._id;
    user_timelines = userObj.timelines;

    fillUserTimelinesList();
  });

});

//Assign listener for window resizing
window.addEventListener("resize", resizeContainers);

$("#flexi_form_start").click(function() {
    introJs().start();
  });




/**
 * TEMPORAL
 bValid = bValid && checkRegexp( name, /^[a-z]([0-9a-z_])+$/i, "Username may consist of a-z, 0-9, underscores, begin with a letter." );
 // From jquery.validate.js (by joern), contributed by Scott Gonzalez: http://projects.scottsplayground.com/email_address_validation/
 bValid = bValid && checkRegexp( email, /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i, "eg. ui@jquery.com" );
 bValid = bValid && checkRegexp( password, /^([0-9a-zA-Z])+$/, "Password field only allow : a-z 0-9" );
 */