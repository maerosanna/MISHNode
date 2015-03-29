/**
 * Function that fill the time ruler
 *
 * @param {momnet} dateOfReference
 * @returns {undefined}
 */
function fillTimeRulerMonths(dateOfReference, xPosDiff) {
  //Así viene la fecha y el x pos cuando llega desde semanas:
  //      Object { posX: 957.2999877929688, idText: "02032015" }

  //Calculate the center of the window
  var center = jQuery(window).width() / 2;

  if (xPosDiff !== null) {
    center -= center - xPosDiff;
  }

  //Draw all the groups of the time ruler:
  //1. Calculate the x position for the first group ('center' will be used in this operation)
  //2. Loop from 10 months before the center date till 10 months after the center date

  var firstGroupDate = dateOfReference.clone().subtract(10, "years");

  var monthsFromFirstGroup = dateOfReference.diff(firstGroupDate, "months");
  var initialXPos = ((( (monthsFromFirstGroup + dateOfReference.date()) * cellWidth) - cellWidth) * -1) + (center);

  var groupToDraw = firstGroupDate.clone().startOf("year");
  var xPositionOfGroup = initialXPos - mishGA.timeRulerXPos;

  if (mishGA.timeRulerGroups.length === 0) {
    for (var i = 0; i <= 20; i++) {
      var widthOfGroup = 12 * cellWidth;//A year has 12 months...

      fillDateRangeMonths(1,//begin: All months start with 1
        12,//end
        0,//Initial xPos of the inner cells
        groupToDraw,//startDate
        true,//drawSeparator
        createRulerGroup(groupToDraw.format('MMYYYY'),//groupID
          widthOfGroup,
          xPositionOfGroup,
          true)//PUSH the group in the groups array
      );
      xPositionOfGroup += widthOfGroup;
      groupToDraw.add(1, "year");
    }
  } else {
    mishGA.timeRulerGroups.forEach(function (value, index) {
      //Remove the cells in the group
      value.children('.date').remove();

      var groupID = 'mish-cellsGroup-' + groupToDraw.format('MMYYYY') + '-' + (index + 1);
      var widthOfGroup = 12 * cellWidth;

      value.attr('id', groupID);
      value.width(widthOfGroup);
      value.css('left', xPositionOfGroup);

      fillDateRangeMonths(1,//begin: All months start with 1
        12,//end
        0,//xPos
        groupToDraw,//startDate
        true,//drawSeparator
        groupID//groupID
      );

      xPositionOfGroup += widthOfGroup;
      groupToDraw.add(1, "year");
    });
  }

  //Create the canvas if necessary
  if (mishGA.canvasObject === null) {
    //Set the global X position in the window's center
    globalPosX = center;

    mishGA.canvasObject = canvasApp(globalPosX, globalPosY);
  }else if(mishGA.canvasObject.render === false){
    mishGA.canvasObject.continueRender();
  }
}

/**
 * Function to Determine if it is necessary to add a block of cells to the time ruler.
 *
 * @param {boolean} evaluateAdditionToRight Determines the side to evaluate for the possible addition of a group
 */
function addGroupToTimerulerMonths(evaluateAdditionToRight) {
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
      var newGroupDate = moment(jQuery(lastDateOfTimeRuler.children('.date')[0]).attr('id').split('-')[1], "MMYYYY").add(1, "year");

      //2. Get the X position for the first date of the new group
      var widthOfNewGroup = 12 * cellWidth;
      var xPosNewLastDate = xPosLastDate + lastDateOfTimeRuler.width();

      //3. Create the new group of cells)
      fillDateRangeMonths(1,//begin: All months start with 1
        12,//end
        0,//Initial xPos of the inner cells
        newGroupDate.clone().startOf("year"),//startDate
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
      //    var centerDateCellID = center_date.format('DDMMYYYY');
      //    jQuery("#mish-cell-" + centerDateCellID).attr("class", centerDateCssClass);
      //    jQuery("#mish-label-" + centerDateCellID).text(center_date.format('DD-MMMM-YYYY'));
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
      var newGroupDate = moment(jQuery(firstDateOfTimeRuler.children('.date')[0]).attr('id').split('-')[1], "MMYYYY").subtract(1, "year");

      //2. Get the X position for the first date of the new group
      var widthOfNewGroup = 12 * cellWidth;
      var xPosNewFirstDate = xPosFirstDate - widthOfNewGroup;

      //3. Create the new group of cells)
      fillDateRangeMonths(1,//begin: All months start with 1
        12,//end
        0,//Initial xPos of the inner cells
        newGroupDate.clone().startOf("year"),//startDate
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
      //    var centerDateCellID = center_date.format('DDMMYYYY');
      //    jQuery("#mish-cell-" + centerDateCellID).attr("class", centerDateCssClass);
      //    jQuery("#mish-label-" + centerDateCellID).text(center_date.format('DD-MMMM-YYYY'));
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
function fillDateRangeMonths(begin, end, xPos, startDate, drawSeparator, groupID) {
  var daysToAdd = 0;
  for (var i = begin; i <= end; i++) {
    var theDay = startDate.clone().add(daysToAdd, "months");
    var cellID = theDay.format('MMYYYY');
    if (i === begin && drawSeparator === true) {
      createTimelineCell(cellID, xPos, separatorDateCssClass, theDay.format('YYYY'), groupID, cellWidth);
    } else {
      createTimelineCell(cellID, xPos, normalDateCssClass, theDay.format('MMM'), groupID, cellWidth);
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
function zoomTimeRulerMonths(centerCellObj, delta) {
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
  var screenCenter = jQuery(window).width() / 2;
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

function calculateXPosOfEventMonths(groupTime,eventTime){
  var difference = moment(eventTime).diff(moment(groupTime),'days');
  var daysWidth = cellWidth / 30;
  return difference * daysWidth;
}

function changeOfLevelMonths(lastLevel, centerCellObj){
  var center = mishGA.workAreaWidth / 2;
  if(lastLevel === "WEEKS"){
    //If the last zoom LEVEL was WEEKS then:
    var dateOfReference = moment('' + centerCellObj.idText, "DDMMYYYY");

    //1. Get number of days that has the nearest month to the screen center (reference date).
    var daysInMonth = dateOfReference.clone().endOf("month").date();

    //2. Get the day number in the nearest month to the screen center (reference date).
    var dayNumber = dateOfReference.date();

    //3. Get the month number (0 - 11) of the nearest month to the screen center  (reference date).
    var monthNumber = dateOfReference.month();

    //4. Calculate the amount of pixels from the first day of the year to the day of the reference date.
    centerCellObj.posX = center - ( (monthNumber*cellWidth) + ( Math.floor(cellWidth/daysInMonth) * dayNumber ) );
    
    //5. Make the reference date as the first day of the year
    centerCellObj.idText = (dateOfReference.startOf('year')).format("DDMMYYYY");
  }else if(lastLevel === "YEARS"){
    //If the last zoom LEVEL was YEARS then:
    var centerYearMoment = moment('' + centerCellObj.idText, "MMYYYY");

    //1. Get the width of each day
    var dayWidth = centerCellObj.groupWidth / centerYearMoment.clone().endOf("year").dayOfYear();

    //2. Get the distance from the X position of the year to the screen center
    var distanceToCenter = center - centerCellObj.posX;
    if(distanceToCenter < 0){
      //The calculation of the day will be made with the nearest year to the center from the left.
      //For that reason, if the distance is negative it is necessary to subtract a year
      centerCellObj.idText = centerYearMoment.subtract(1, 'year').format("YYYY");
    }

    //3. Get the amount of days of the nearest year (from LEFT) to the screen center
    var daysOfYear = centerYearMoment.clone().endOf("year").dayOfYear();

    //4. Get the number of days contained in the distance to the center
    var numberOfDays = Math.ceil(Math.abs(distanceToCenter) / dayWidth);
    if(distanceToCenter < 0){
      //If the nearest year to the center is right to it, it is necessary to subtract the
      //number of days obtained to the number of days of the previous year
      numberOfDays = daysOfYear - numberOfDays;
    }

    //5. Get the date for reference from the number of days obtained
    var referenceMoment = centerYearMoment.clone().dayOfYear(numberOfDays);

    var monthNumber = referenceMoment.month();
    var daysInMonth = referenceMoment.clone().endOf("month").date();
    var dayNumber = referenceMoment.date();

    centerCellObj.posX = center - ( (monthNumber*cellWidth) + ( (cellWidth/daysInMonth) * dayNumber ) );
    centerCellObj.idText = (referenceMoment.startOf('year')).format("DDMMYYYY");

  }
}