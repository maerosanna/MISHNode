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
  //Hide the panel with the list of timelines of the user
  showTimelinesPanel(false);

  //1. Get the timeline information and assign it to the mishJsonObjs.timelineJson object
  mishJsonObjs.timelineJson = user_timelines[index];

  //2. Get the events of the loaded timeline
  mishJsonObjs.eventsJsonElement = mishJsonObjs.timelineJson.events;

  //2.1 Set some required information (if it's necessary) to the timeline events
  mishJsonObjs.eventsJsonElement.forEach(function (eventObj) {
    if (eventObj.date) {
      //If the event hasn't time information, calculate it
      if (!eventObj.time) {
        eventObj.time = moment(eventObj.date).valueOf();
      }

      if(eventObj.image){
        createImgElementFrom(eventObj.image, function(imageElement){
          eventObj.imageElement = imageElement;
        });
      }
    }
  });

  //3. Draw the time ruler and all the events
  drawTimeRuler();
}