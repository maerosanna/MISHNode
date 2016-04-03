/**
 * This file contains methods for calculations
 */

function calculateDistance(date1, date2) {
  var distance = (moment(date2).diff(moment(date1), '' + zoom_local));
  return (distance <= 0) ? distance : distance + 1;
}

/**
 * Function that calculate the center date of all the events in the current timeline.
 *
 * @returns {moment}
 */
function findCenterDate() {
  if(supermish.timelineEvents && supermish.timelineEvents.length > 0){
    var eventInMiddle = Math.floor(supermish.timelineEvents.length / 2);
    return (moment(supermish.timelineEvents[eventInMiddle].storeableData.date, 'DD-MM-YYYY')).format('DD-MM-YYYY');
  }else{
    return moment().format('DD-MM-YYYY');
  }
}

/**
 * Function that search the nearest cell to the screen center and return
 * its X position and ID in an Object.
 *
 * @returns {{posX: *, idText: *}}
 */
function findNearestCellToCenter() {
  //Obtain the center of the window
  var center = jQuery(window).width() / 2;

  //Find the group in which the center is contained
  var timeRulerXPos = mishGA.timeRulerXPos;
  var groupOfCenter = mishGA.timeRulerGroups.filter(function (value) {
    var absoluteXPosOfGroup = value.position().left + timeRulerXPos;
    return absoluteXPosOfGroup <= center && (absoluteXPosOfGroup + value.width()) >= center;
  });

  //Find the cell in the group nearest to the center
  var xPosOfGroup = groupOfCenter[0].position().left + timeRulerXPos;
  var leftNearestValue = -1;
  var rightNearestValue = -1;
  var nearestCellToCenterIndex = -1;
  var cellsInGroup = groupOfCenter[0].children('.date');
  var elementPos = -1;//Posición en X de la celda más cercana al centro de la pantalla
  cellsInGroup.each(function (index, element) {
    //Get the X position of the current cell
    elementPos = jQuery(this).position().left + xPosOfGroup;

    //This is necessary for prevent errors when the center is contained in the last cell of the group
    nearestCellToCenterIndex = index;

    if (elementPos === center) {
      return false;//Break the loop
    } else if (elementPos < center) {
      leftNearestValue = elementPos;
    } else if (elementPos > center) {
      rightNearestValue = elementPos;
      //Calculate the nearest point to the center between 'leftNearestValue' and 'rightNearestValue'
      leftNearestValue = center - leftNearestValue;
      rightNearestValue = Math.abs(center - rightNearestValue);
      nearestCellToCenterIndex = (leftNearestValue <= rightNearestValue) ? (index - 1) : (index);
      return false;//Break the loop
    }
  });

  var nearestCellToCenter = jQuery(cellsInGroup[nearestCellToCenterIndex]);
  var _idSplit = nearestCellToCenter.attr('id').split('-');//Get the nearest cell to center ID for create a moment()
  var _idText = _idSplit[1];
  var _negativeYear = false;
  if(_idSplit.length > 2){
    _idText += "-" + _idSplit[2];
    _negativeYear = true;
  }
  return {
    groupWidth: nearestCellToCenter.width(),
    groupPosX: xPosOfGroup,
    posX: nearestCellToCenter.position().left + xPosOfGroup,//Get the nearest cell to center X position for accurate calculations
    idText: _idText,
    negativeYear: _negativeYear
  };
}

/**
 * Function that find the group that contains the time (date in milliseconds) received as parameter.
 *
 * @param eventTime : number
 * @returns object
 */
function findGroupOfEvent(eventTime, isBC) {
  //1. Verify if the event date is between the first date and the last date of the time ruler groups
  if (eventTime < getTimeOfGroupId(mishGA.timeRulerGroups[0]) &&
      eventTime > getTimeOfGroupId(mishGA.timeRulerGroups[mishGA.timeRulerGroups.length - 1]) ){
    return null;
  }

  //2. Search the group for the event date
  var groupOfDate = null;

  if (!isBC || isBC === false) {
    for (var i = mishGA.timeRulerGroups.length - 1; i >= 0; i--) {
      // ignore years of more of 4 digits in dates A.C.
      if (mishGA.timeRulerGroups[i].attr('id').split('-')[2].length > 6 &&
          mishGA.timeRulerGroups[i].attr('id').split('-').length === 4) {
        // ! mishGA.timeRulerGroups[i].attr('id').split('-').length === 4 represents dates A.C.
        //   dates B.C. are of length 5 because de '-' sign of the date
        continue;
      }

      var groupTime = getTimeOfGroupId(mishGA.timeRulerGroups[i], false);
      if (eventTime >= groupTime) {
        groupOfDate = mishGA.timeRulerGroups[i];
        break;
      }
    }
  }
  else {
    // if (test === false) {
    //   console.log("eventTime", eventTime);
    // }

    for (var i = mishGA.timeRulerGroups.length - 1; i >= 0; i--) {
      // ignore years of more of 4 digits in dates B.C.
      if (mishGA.timeRulerGroups[i].attr('id').split('-')[3].length > 6 &&
          mishGA.timeRulerGroups[i].attr('id').split('-').length === 5) {
        // ! mishGA.timeRulerGroups[i].attr('id').split('-').length === 4 represents dates A.C.
        //   dates B.C. are of length 5 because de '-' sign of the date
        continue;
      }

      var groupTime = getTimeOfGroupId(mishGA.timeRulerGroups[i], true);
      if (mishGA.timeRulerGroups[i].attr('id').split('-').length === 5 &&
          groupTime > 0) {
        groupTime *= -1;
      }
      else if (mishGA.timeRulerGroups[i].attr('id').split('-').length === 4 &&
          groupTime < 0) {
        groupTime *= -1;
      }

      if (groupTime > 0) {
        // ignore groups A.C.
        continue;
      }
      
      // if (test === false) {
      //   console.log("groupTime[%s]", i, groupTime);
      // }
      
      if (groupTime >= eventTime) {
        groupOfDate = mishGA.timeRulerGroups[i];
        
        // if (test === false) {
        //   console.log("groupOfDate ", groupOfDate);
        // }
        
        break;
      }
    }
  }

  test = true;

  //3. Return the found group
  return groupOfDate;
}

/**
 * Function that calculates the X position for drawing the event received as second parameter.
 *
 * @param eventGroup : object
 * @param event : object
 * @returns number
 */
function calculateXPosOfEvent(eventGroup, event){
  //1. Calculate the X position of the group
  var eventGroupXPos = mishGA.timeRulerXPos + eventGroup.position().left;

  //2. Calculate the X position of the event
  var eventXPos = mishGA.zoomData.calculateXPosOfEvent(getTimeOfGroupId(eventGroup), event.time);

  if(eventXPos !== null && eventGroupXPos !== null
      && eventXPos !== undefined && eventGroupXPos !== undefined){
    return eventXPos + eventGroupXPos;
  }
}
