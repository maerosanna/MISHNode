/**
 * Function that fill the time ruler
 *
 * @param {momnet} dateOfReference
 * @returns {undefined}
 */
function fillTimeRulerDays(dateOfReference, xPosDiff) {
  //Calculate the center of the window
  var center = mishGA.workAreaWidthHalf;

  if (xPosDiff !== null) {
    center -= center - xPosDiff;
  }

  //Draw all the groups of the time ruler:
  //1. Calculate the x position for the first group ('center' will be used in this operation)
  //2. Loop from 10 months before the center date till 10 months after the center date

  var firstGroupDate = dateOfReference.clone().subtract(10, "months");

  var daysFromFirstGroup = dateOfReference.diff(firstGroupDate, "days");
  var initialXPos = ((( (daysFromFirstGroup + dateOfReference.date()) * cellWidth) - cellWidth) * -1) + (center);

  var groupToDraw = firstGroupDate.clone().startOf("month");
  var xPositionOfGroup = initialXPos - mishGA.timeRulerXPos;

  if (mishGA.timeRulerGroups.length === 0) {
    for (var i = 0; i <= 20; i++) {
      var widthOfGroup = groupToDraw.clone().daysInMonth() * cellWidth;

      fillDateRangeDays(1,//begin: All months start with 1
        widthOfGroup / cellWidth,//end
        0,//Initial xPos of the inner cells
        groupToDraw,//startDate
        true,//drawSeparator
        createRulerGroup(groupToDraw.format('MMYYYY'),//groupID
          widthOfGroup,
          xPositionOfGroup,
          true)//PUSH the group in the groups array
      );
      xPositionOfGroup += widthOfGroup;
      groupToDraw.add(1, "month");
    }
  } else {
    mishGA.timeRulerGroups.forEach(function (value, index) {
      //Remove the cells in the group
      value.children('.date').remove();

      var groupID = 'mish-cellsGroup-' + groupToDraw.format('MMYYYY') + '-' + (index + 1);
      var widthOfGroup = groupToDraw.clone().daysInMonth() * cellWidth;

      value.attr('id', groupID);
      value.width(widthOfGroup);
      value.css('left', xPositionOfGroup);

      fillDateRangeDays(1,//begin: All months start with 1
        widthOfGroup / cellWidth,//end
        0,//xPos
        groupToDraw,//startDate
        true,//drawSeparator
        groupID//groupID
      );

      xPositionOfGroup += widthOfGroup;
      groupToDraw.add(1, "month");
    });
  }

  //Put a special style in the center date of the timeline
  var centerDateCellID = center_date.format('DDMMYYYY');
  jQuery("#mish-cell-" + centerDateCellID).attr("class", centerDateCssClass);
  jQuery("#mish-label-" + centerDateCellID).text(center_date.format('DD-MMMM-YYYY'));
}

/**
 * Function to Determine if it is necessary to add a block of cells to the time ruler.
 *
 * @param {boolean} evaluateAdditionToRight Determines the side to evaluate for the possible addition of a group
 */
function addGroupToTimerulerDays(evaluateAdditionToRight) {
  //To do this, we take the X position of the first date in the first group
  //and subtract to that value 60 cells. With this, we ensure that a new group
  //will be added only when the time ruler reach 60 cells of distance to the first date.
  //A similar process is done for the last date of the last group.

  //TODO : Improve the search of the center date. It should be done only when the added group match its date and the jQuery search must be called just once.

  if (evaluateAdditionToRight) {
    //The time ruler was moved to the left, so....LETS ADD A GROUP TO THE RIGHT

    //0. Get the last group and it's X position
    var lastDateOfTimeRuler = mishGA.timeRulerGroups[mishGA.timeRulerGroups.length - 1];
    var xPosLastDate = lastDateOfTimeRuler.position().left;

    //If the time ruler X position is 30 cells to the left of the last date X position, then is time to add a group to the right
    if ((xPosLastDate - (cellWidth * 90)) <= (mishGA.timeRulerXPos * -1)) {
      //It is necessary to add a group of cells to the right of the ruler >>>

      //1. Get the date for the new group
      var newGroupDate = moment(jQuery(lastDateOfTimeRuler.children('.date')[0]).attr('id').split('-')[1], "DDMMYYYY").add(1, "month");

      //2. Get the X position for the first date of the new group
      var widthOfNewGroup = newGroupDate.clone().endOf("month").date() * cellWidth;
      var xPosNewLastDate = xPosLastDate + lastDateOfTimeRuler.width();

      //3. Create the new group of cells)
      fillDateRangeDays(1,//begin: All months start with 1
        widthOfNewGroup / cellWidth,//end
        0,//Initial xPos of the inner cells
        newGroupDate.clone().startOf("month"),//startDate
        true,//drawSeparator
        createRulerGroup(newGroupDate.format('MMYYYY'),//groupID
          widthOfNewGroup,
          xPosNewLastDate,
          true)//PUSH the group in the groups array
      );

      //4. Remove the first left block of cells in the time ruler and remove the group in 'timeRulerGroups'
      mishGA.timeRulerGroups[0].remove();
      mishGA.timeRulerGroups.shift();

      //5. Reassign the IDs for the groups in 'mishGA.timeRulerGroups'
      var counter = 1;
      mishGA.timeRulerGroups.forEach(function (value) {
        var idParts = value.attr('id').split('-');
        idParts[3] = counter;
        value.attr('id', idParts.join('-'));
        counter++;
      });

      //Put a special style in the center date of the timeline
      var centerDateCellID = center_date.format('DDMMYYYY');
      jQuery("#mish-cell-" + centerDateCellID).attr("class", centerDateCssClass);
      jQuery("#mish-label-" + centerDateCellID).text(center_date.format('DD-MMMM-YYYY'));
    }
  } else {
    //The time ruler was moved to the right, so....LETS ADD A GROUP TO THE LEFT

    //0. Get the first group and it's X position
    var firstDateOfTimeRuler = mishGA.timeRulerGroups[0];
    var xPosFirstDate = firstDateOfTimeRuler.position().left;

    //If the time ruler X position is 60 cells to the right of the first date X position, then is time to add a group to the left
    if (((xPosFirstDate + (cellWidth * 60)) * -1) <= mishGA.timeRulerXPos) {
      //It is necessary to add a group of cells to the left of the ruler >>>

      //1. Get the date for the new group
      var newGroupDate = moment(jQuery(firstDateOfTimeRuler.children('.date')[0]).attr('id').split('-')[1], "DDMMYYYY").subtract(1, "month");

      //2. Get the X position for the first date of the new group
      var widthOfNewGroup = newGroupDate.clone().endOf("month").date() * cellWidth;
      var xPosNewFirstDate = xPosFirstDate - widthOfNewGroup;

      //3. Create the new group of cells)
      fillDateRangeDays(1,//begin: All months start with 1
        widthOfNewGroup / cellWidth,//end
        0,//Initial xPos of the inner cells
        newGroupDate.clone().startOf("month"),//startDate
        true,//drawSeparator
        createRulerGroup(newGroupDate.format('MMYYYY'),//groupID
          widthOfNewGroup,
          xPosNewFirstDate,
          false)//UNSHIFT the group in the groups array
      );

      //4. Remove the last right block of cells in the time ruler and remove the group in 'timeRulerGroups'
      mishGA.timeRulerGroups[mishGA.timeRulerGroups.length - 1].remove();
      mishGA.timeRulerGroups.pop();

      //5. Reassign the IDs for the groups in 'mishGA.timeRulerGroups'
      var counter = 1;
      mishGA.timeRulerGroups.forEach(function (value) {
        var idParts = value.attr('id').split('-');
        idParts[3] = counter;
        value.attr('id', idParts.join('-'));
        counter++;
      });

      //Put a special style in the center date of the timeline
      var centerDateCellID = center_date.format('DDMMYYYY');
      jQuery("#mish-cell-" + centerDateCellID).attr("class", centerDateCssClass);
      jQuery("#mish-label-" + centerDateCellID).text(center_date.format('DD-MMMM-YYYY'));
    }
  }
}

/*
 * Function that create time ruler cells for an amount of days
 *
 * @param {int} begin
 * @param {int end
 * @param {int} xPos
 * @param {Moment} startDate The first day of the month to draw (this depends of the ZOOM level)
 * @param {boolean} drawSeparator Indicates if the first cell to draw will be a separator cell
 * @param {String} groupID
 * @returns {undefined}
 */
function fillDateRangeDays(begin, end, xPos, startDate, drawSeparator, groupID) {
  var daysToAdd = 0;
  for (var i = begin; i <= end; i++) {
    var theDay = startDate.clone().add(daysToAdd, "days");
    var cellID = theDay.format('DDMMYYYY');
    if (i === begin && drawSeparator === true) {
      var cellText = theDay.format('DD-MMMM');
      var year = theDay.year();
      if(year < 0){
        year = Math.abs(year) + " A.C.";
      }
      cellText += "-" + year;

      //  Before: theDay.format('DD-MMMM-YYYY')
      createTimelineCell(cellID, xPos, separatorDateCssClass, cellText, groupID, cellWidth);
    } else {
      createTimelineCell(cellID, xPos, normalDateCssClass, i, groupID, cellWidth);
    }
    daysToAdd++;
    xPos = xPos + cellWidth;
  }
}

/**
 * Function that changes the WIDTHS and X positions of all the cells in the time ruler
 *
 * @param centerCellObj
 * @param delta
 */
function zoomTimeRulerDays(centerCellObj, delta) {
//Assign the new WIDTH for each cell and each group and also the new LEFT position of each cell.
  mishGA.timeRulerGroups.forEach(function (value, index) {
    var childCount = 0;
    var xPos = 0;
    value.children(".date").each(function () {
      jQuery(this).css({
        "left": xPos,
        "width": cellWidth + "px"
      });
      xPos += cellWidth;
      childCount++;
    });

    var newGroupWidth = cellWidth * childCount;
    value.css({"width": newGroupWidth + "px"});
  });

  //Get other information needed for the operation
  var screenCenter = mishGA.workAreaWidthHalf;
  if (centerCellObj !== null
    && centerCellObj.posX !== null) {
    screenCenter -= screenCenter - centerCellObj.posX;
  }
  var lastCellWidth = cellWidth - delta;

  //Get the initial LEFT position of the current time ruler groups
  var oldTimeRulerXPos = mishGA.timeRulerGroups[0].position().left + (mishGA.timeRulerXPos - screenCenter);

  //Calculate the LEFT position for the new time ruler
  var newTimeRulerXPos = 0;

  //Assign the new LEFT position for each group of the time ruler
  mishGA.timeRulerGroups.forEach(function (value, index) {
    if (index == 0) {
      newTimeRulerXPos = ( ( ( ( (oldTimeRulerXPos * cellWidth) / lastCellWidth ) + cellWidth ) + screenCenter ) - cellWidth );
      newTimeRulerXPos -= mishGA.timeRulerXPos;
    }
    value.css({"left": newTimeRulerXPos + "px"});
    newTimeRulerXPos += value.width();
  });
}


function calculateXPosOfEventDays(groupTime,eventTime){
  var difference = moment(eventTime).diff(moment(groupTime), 'days');
  return difference * cellWidth;
}

function changeOfLevelDays(lastLevel, centerCellObj){
  // @TODO Maybe not
}