/**
 * This file controls the drawing and event handle over the <div id="timeline-container">
 */

/**
 * Function that draws the basic time ruler whether a saved timeline is loaded or is a new timeline.
 *
 * @returns {undefined}
 */
function drawTimeRuler() {
  //Get the center date of the timeline loaded by the user
  if (mishJsonObjs.timelineJson
      && mishJsonObjs.timelineJson.centerDate) {
    center_date = moment(mishJsonObjs.timelineJson.centerDate);
  }
  clearTimeline();
  mishGA.zoomData.fillTimeRuler(center_date, null);
}

/**
 * Function thar erase all the content in the timeline ruler.
 *
 * @returns {undefined}
 */
function clearTimeline() {
  jQuery("#timeline-container").empty();
  mishGA.timeRulerGroups = [];
}

/**
 * Function that creates a new group for containing cell of the time ruler.
 *
 * @param date
 * @param widthAmount
 * @param xPositionOfGroup
 * @param push
 * @returns {string}
 */
function createRulerGroup(date, widthAmount, xPositionOfGroup, push) {
  /*//replace("-", "") >> necessary for negative years
  if(date.indexOf("-") != -1){
    date += "-A.C.";
    date = date.replace("-", "");
  }*/
  var groupID = 'mish-cellsGroup-' + date + '-' + (mishGA.timeRulerGroups.length + 1);
  var divObject = jQuery('<div/>', {
    id: groupID
    , class: 'rulerGroup'
    , width: widthAmount
  }).css("left", xPositionOfGroup);

  if (push) {
    mishGA.timeRulerGroups.push(divObject);
    divObject.appendTo("#timeline-container");
  } else {
    mishGA.timeRulerGroups.unshift(divObject);
    divObject.prependTo("#timeline-container");
  }

  return groupID;
}

/**
 * Function that draws the DIVs that represents a cell in the time ruler.
 *
 * @param id
 * @param xPosition
 * @param cellClass
 * @param cellText
 * @param groupID
 * @param dateWidth
 */
function createTimelineCell(id, xPosition, cellClass, cellText, groupID, dateWidth) {
  /*//replace("-", "") >> necessary for negative years
  if(id.indexOf("-") != -1){
    id += "-A.C.";
    id = id.replace("-", "");
  }*/
  jQuery('<div/>', {
    id: 'mish-label-' + id,
    class: 'label'
  }).text("" + cellText).appendTo(jQuery('<div/>', {
      id: 'mish-cell-' + id,
      class: cellClass
    }
  ).appendTo(jQuery('<div/>', {
      id: 'mish-' + id,
      class: 'date',
      groupedCells: (dateWidth / cellWidth)
    }).css({
      "left": "" + parseInt(xPosition) + "px",
      "width": dateWidth + "px"
    }).appendTo('#' + groupID)));
}


/**
 * Function that creates the DIVs for the list of saved timelines for the
 * logged in user.
 *
 */
function fillUserTimelinesList() {
  if(!user_timelines){
    return;
  }

  jQuery(".user_timeline_removable").remove();

  user_timelines.forEach(function(timelineObj, index){
    jQuery('<li/>', {
      "id": 'timeline-' + index,
      "class": "user_timeline_removable",
      "onclick": "openTimeline(" + index + ")"
    }).appendTo(
      jQuery('.user_timelines_list_ul')
    );

    jQuery('<a/>',{"href":"#"}).text(timelineObj.name.toUpperCase()).appendTo(
      jQuery('#timeline-' + index)
    );
  });

  jQuery('#logInDialog').dialog('close');

}

/**
 * Function that opens the timeline stored in the received index.
 *
 * It assigns all the information needed for the draw of the time ruler 
 * and the events to the respective objects of mishJsonObjs.
 * 
 * @param  {number} index The index of the array
 * 
 */
function openTimeline(index){
  //Clear all the data of the current timeline
  resetTimeruler();

  showLoadingAnimation(true);

  var eventsWithImages = 0;

  //Hide the panel with the list of timelines of the user
  showTimelinesPanel(false);

  //1. Get the timeline information and assign it to the mishJsonObjs.timelineJson object
  mishJsonObjs.timelineJson = cloneObj(user_timelines[index]);
  mishJsonObjs.timelineJson.index = index;

  updateTimelineTitleBar(mishJsonObjs.timelineJson.name);

  //2. Clone the events of the loaded timeline
  mishJsonObjs.timelineJson.events = [];
  user_timelines[index].events.forEach(function(_event, index){
    mishJsonObjs.timelineJson.events.push(cloneObj(_event));
  });

  //2.1 Set some required information (if it's necessary) to the timeline events
  mishJsonObjs.timelineJson.events.forEach(function (eventObj, index) {
    if (eventObj.date) {
      //If the event hasn't time information, calculate it
      if (!eventObj.time) {
        eventObj.time = moment(eventObj.date).valueOf();
      }
    }

    eventObj.date = moment(eventObj.date).format("DD-MM-YYYY");

    var groupOfDate = findGroupOfEvent(eventObj.time);
    var eventXPos = 0;
    if(groupOfDate){
      eventXPos = calculateXPosOfEvent(groupOfDate, eventObj);
    }
    var mishEvent = new Mish.Event(eventObj, groupOfDate, eventXPos, globalPosY, supermish.renderer);
    supermish.pushEvent(mishEvent);

    if(eventObj.image){
      eventsWithImages++;
      getEventImage(eventObj._id, index, function(err, eventIndex, imageData){
        if(err){
          console.log("Event: " + index + " image not loaded", err);
        }

        if(eventIndex && imageData){
          //In some cases, like the cloud9 one, "imageData" is an Array, not an object with a "data" attribute
          var arrayBuffer = imageData.data || imageData;
          var bytes = new Uint8Array(arrayBuffer);
          var res = new Image();
          res.src = 'data:image/png;base64,' + encode(bytes);

          mishEvent.storeableData.image = arrayBuffer;
          mishEvent.storeableData.imageElement = res;
          mishEvent.imageElement = res;
        }

        eventsWithImages--;
        if(eventsWithImages <= 0){
          //Hide the loading animation
          showLoadingAnimation(false);

          drawTimeRuler();
        }

      });

    }
  });

  //3. Draw the time ruler and all the events
  if(eventsWithImages == 0){
    showLoadingAnimation(false);
    drawTimeRuler();
  }
}