/**
 * This file controls the drawing and event handle over the <div id="timeline-container">
 */

/**
 * Function called when a timeline is loaded. It assigns all the information needed for the draw of
 * the time ruler and the events to the respective objects of mishJsonObjs.
 *
 * @param jsonObj
 */
function timeLineJsonLoaded(jsonObj) {
  //1. Get the timeline information and assign it to the mishJsonObjs.timelineJson object
  mishJsonObjs.timelineJson = jsonObj.timeline;

  //2. Get the events of the loaded timeline
  mishJsonObjs.eventsJsonElement = mishJsonObjs.timelineJson.events;

  //2.1 Set some required information (if it's necessary) to the timeline events
  mishJsonObjs.eventsJsonElement.forEach(function (eventObj) {
    if (eventObj.date) {
      //0. If the event hasn't time information, calculate it
      if (!eventObj.time) {
        eventObj.time = moment(eventObj.date, 'DD-MM-YYYY').valueOf();
      }
    }
  });

  //3. Draw the time ruler and all the events
  drawTimeRuler();
}

/**
 * Function that draws the basic time ruler whether a saved timeline is loaded or is a new timeline.
 *
 * @returns {undefined}
 */
function drawTimeRuler() {
  //Get the center date of the timeline loaded by the user
  if (mishJsonObjs.timelineJson
    && mishJsonObjs.timelineJson.centerDate) {
    center_date = moment(mishJsonObjs.timelineJson.centerDate, "DD-MM-YYYY");
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
function loadUserTimelines() {
  var col_cont = 1;
  jQuery.each(user_timelines, function (key, value) {
    jQuery('<li/>', {
      "id": 'timeline-' + key,
      "class": "user_timeline_removable",
      "onclick": "openTimeline(" + key + ")"
    }).appendTo(
      jQuery('.user_timelines_list_ul')
    );

    jQuery('<a/>',{"href":"#"}).text(value.toUpperCase()).appendTo(
      jQuery('#timeline-' + key)
    );

    col_cont++;
    user_timelines_count++;
  });

  jQuery('#logInDialog').dialog('close');

}