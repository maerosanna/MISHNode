/**
 * Function that calculates the size, width and height of the main containers.
 *
 * @returns {undefined}
 */
function resizeContainers() {
  mishGA.workAreaWidth = jQuery(window).width();
  mishGA.workAreaHeight = jQuery(window).height() - 75 - 40;

  jQuery("#work-area-container").css("width", mishGA.workAreaWidth);
  jQuery("#work-area-container").css("height", mishGA.workAreaHeight);

  if (mishGA.canvasObject !== null) {
    mishGA.canvasObject.setAttribute("width", mishGA.workAreaWidth);
    mishGA.canvasObject.setAttribute("height", mishGA.workAreaHeight);
  }
}

/**
 * Function for get the specific message in 'id' param.
 *
 * @param {type} id
 * @returns {msg|messagesObject.msg}
 */
function getMessage(id) {
  return msg["" + id];
}

/**
 * Function that clean the error messages in the specified DIV.
 *
 * @param {type} containerDiv The ID of the DIV
 * @returns {undefined}
 */
function clearErrorMessages(containerDiv) {
  jQuery(containerDiv).empty();
}

/**
 * Function that appends an error message to the specified DIV.
 *
 * @param {type} containerDiv The ID of the DIV
 * @param {type} messageId The message to show
 * @returns {undefined}
 */
function appendErrorMessage(containerDiv, messageId) {
  jQuery(containerDiv).append("<p>" + msg[messageId] + "</p>");
}

/**
 * Function that shows xor hide an error message element.
 *
 * @param {string} id
 * @param {boolean} show
 */
function showErrorMsg(id,show){
  if(show){
    jQuery(id).show("blind", 200);
  }else{
    jQuery(id).hide("blind", 100);
  }
}

/**
 * Function that close the specified Dialog window.
 *
 * @param {string} id
 */
function closeDialog(id) {
  jQuery(id).dialog('close');
}

/**
 * Function that creates a Dialog box for the DIV identified by the first
 * parameter with the title of the second parameter.
 *
 * @param {type} id
 * @param {type} title
 * @returns {undefined}
 */
function createBasicDialog(id, title) {
  jQuery(id).dialog({
    title: msg[title],
    autoOpen: false,
    modal: true,
    minWidth: 500,
    minHeight: 189,
    resizable: false,
    draggable: false,
    show: {
      effect: "fade",
      duration: 400
    },
    open: function (event, ui) {
      clearDialogFields(this);
      hideErrorMessages(this);
    }
  });
}

/**
 * Function that clear all the INPUT elements contained in the specified DIV.
 *
 * @param {type} element
 * @returns {undefined}
 */
function clearDialogFields(element) {
  jQuery(element).find(":not(input[type=button])").val("");
}

/**
 * Function that hides all the ERROR elements contained in the specified DIV.
 *
 * @param {type} element
 * @returns {undefined}
 */
function hideErrorMessages(element) {
  jQuery(element).find('div[id^="error"]').hide();
}

/**
 * Function that returns the time, in milliseconds, of the date for the
 * group received as parameter.
 *
 * @param groupObj : jQuery
 * @returns {number}
 */
function getTimeOfGroupId(groupObj){
  return ( moment( '01' + groupObj.attr('id').split('-')[2] , 'DDMMYYYY') ).valueOf();
}

/**
 * Shows an alert message with the text of the code received.
 * 
 * @param  {string} messageCode The code to search in "messages.js"
 * 
 */
function showAlertMessage(isErrorMessage, messageCode){
  if(showing_alert_message === false){
    showing_alert_message = true;
    jQuery(".alert-message").append(msg[messageCode] || messageCode);
    for(var i=2; i<arguments.length ;i++){
      jQuery(".alert-message").append(arguments[i]);
    }
    if(isErrorMessage === true){
      jQuery(".alert-message-container").addClass('error-alert-message-container');
    }else{
      jQuery(".alert-message-container").removeClass('error-alert-message-container');
    }
    jQuery(".alert-message-container").show("fade",450);
    var alertContainerWidth = jQuery(".alert-message-container").width();
    var alertContainerHeight = jQuery(".alert-message-container").height();
    var xPos = (mishGA.workAreaWidth / 2) - (alertContainerWidth / 2);
    var yPos = ((mishGA.workAreaHeight / 2) - (alertContainerHeight / 2)) - 50;
    jQuery(".alert-message-container").css({left:xPos,top:yPos});
    setTimeout(function(){
      jQuery(".alert-message-container").hide("fade", 300, function(){
        jQuery(".alert-message").empty();
      });
      showing_alert_message = false;
    }, 1500);
  }
}

/**
 * Function that creates and <img> element for rendering an image on the canvas.
 * 
 * @param  {string}   source   The data of the image
 * @param  {Function} callback The function to call after loading the image
 * 
 */
function createImgElementFrom(source, callback){
  var res = new Image();
  res.addEventListener('load', function(){
    callback(this);
  }, false);
  res.src = source;
}

function cloneObj(objToClone){
  var clone = objToClone.constructor();

  for (var attr in objToClone) {
    if (objToClone.hasOwnProperty(attr)){
      clone[attr] = objToClone[attr];
    }
  }

  return clone;
};

function showLoadingAnimation(show){
  if(show){
    jQuery("#loading_container").show();
  }else{
    jQuery("#loading_container").hide("fade", 300);
  }
}

function encode (input) {
  var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  var output = "";
  var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
  var i = 0;

  while (i < input.length) {
    chr1 = input[i++];
    chr2 = i < input.length ? input[i++] : Number.NaN; // Not sure if the index 
    chr3 = i < input.length ? input[i++] : Number.NaN; // checks are needed here

    enc1 = chr1 >> 2;
    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
    enc4 = chr3 & 63;

    if (isNaN(chr2)) {
        enc3 = enc4 = 64;
    } else if (isNaN(chr3)) {
        enc4 = 64;
    }
    output += keyStr.charAt(enc1) + keyStr.charAt(enc2) +
              keyStr.charAt(enc3) + keyStr.charAt(enc4);
  }

  return output;
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