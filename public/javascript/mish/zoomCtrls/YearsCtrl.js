/**
 * Function that fill the time ruler
 *
 * @param {momnet} dateOfReference
 * @returns {undefined}
 */
function fillTimeRulerYears(dateOfReference, xPosDiff) {
  //Calculate the center of the window
  var center = mishGA.workAreaWidthHalf;

  if (xPosDiff !== null) {
    center -= center - xPosDiff;
  }

  //Draw all the groups of the time ruler:
  //1. Calculate the x position for the first group ('center' will be used in this operation)
  //2. Loop from 10 DECADES before the center date till 10 months after the center date

  var firstGroupDate = dateOfReference.clone().subtract(100, "years");//Ten decades behind

  var yearsFromFirstGroup = 100;
  var initialXPos = ((( (yearsFromFirstGroup + dateOfReference.date()) * cellWidth) - cellWidth) * -1) + (center);

  var groupToDraw = firstGroupDate.clone().startOf("year");
  var xPositionOfGroup = initialXPos - mishGA.timeRulerXPos;

  if (mishGA.timeRulerGroups.length === 0) {
    for (var i = 0; i <= 20; i++) {
      var widthOfGroup = 10 * cellWidth;//A DECADE has 10 years...

      fillDateRangeYears(1,//begin: All years start with 1
        10,//end
        0,//Initial xPos of the inner cells
        groupToDraw,//startDate
        true,//drawSeparator
        createRulerGroup(groupToDraw.format('MMYYYY'),//groupID
          widthOfGroup,
          xPositionOfGroup,
          true)//PUSH the group in the groups array
      );
      xPositionOfGroup += widthOfGroup;
      groupToDraw.add(10, "year");
    }
  } else {
    mishGA.timeRulerGroups.forEach(function (value, index) {
      //Remove the cells in the group
      value.children('.date').remove();

      var groupID = 'mish-cellsGroup-' + groupToDraw.format('MMYYYY') + '-' + (index + 1);
      var widthOfGroup = 10 * cellWidth;

      value.attr('id', groupID);
      value.width(widthOfGroup);
      value.css('left', xPositionOfGroup);

      fillDateRangeYears(1,//begin: All months start with 1
        10,//end
        0,//xPos
        groupToDraw,//startDate
        true,//drawSeparator
        groupID//groupID
      );

      xPositionOfGroup += widthOfGroup;
      groupToDraw.add(10, "year");
    });
  }
}

/**
 * Function to Determine if it is necessary to add a block of cells to the time ruler.
 *
 * @param {boolean} evaluateAdditionToRight Determines the side to evaluate for the possible addition of a group
 */
function addGroupToTimerulerYears(evaluateAdditionToRight) {
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
      var newGroupDate = moment(jQuery(lastDateOfTimeRuler.children('.date')[0]).attr('id').split('-')[1], "MMYYYY").add(10, "year");

      //2. Get the X position for the first date of the new group
      var widthOfNewGroup = 10 * cellWidth;
      var xPosNewLastDate = xPosLastDate + lastDateOfTimeRuler.width();

      //3. Create the new group of cells)
      fillDateRangeYears(1,//begin: All months start with 1
        10,//end
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
      var newGroupDate = moment(jQuery(firstDateOfTimeRuler.children('.date')[0]).attr('id').split('-')[1], "MMYYYY").subtract(10, "year");

      //2. Get the X position for the first date of the new group
      var widthOfNewGroup = 10 * cellWidth;
      var xPosNewFirstDate = xPosFirstDate - widthOfNewGroup;

      //3. Create the new group of cells)
      fillDateRangeYears(1,//begin: All months start with 1
        10,//end
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
function fillDateRangeYears(begin, end, xPos, startDate, drawSeparator, groupID) {
  var yearsToAdd = 0;
  for (var i = begin; i <= end; i++) {
    var theYear = startDate.clone().add(yearsToAdd, "years");
    var cellID = theYear.format('MMYYYY');
    var cellText = parseInt(theYear.format('YYYY'));
    if(cellText < 0){
      cellText = Math.abs(cellText) + " A.C.";
    }
    if (i === begin && drawSeparator === true) {
      createTimelineCell(cellID, xPos, separatorDateCssClass, cellText, groupID, cellWidth);
    } else {
      createTimelineCell(cellID, xPos, normalDateCssClass, cellText, groupID, cellWidth);
    }
    yearsToAdd++;
    xPos = xPos + cellWidth;
  }
}

/**
 * Function that changes the WIDTHS and X positions of all the cells in the time ruler
 *
 * @param centerCellObj
 * @param delta
 */
function zoomTimeRulerYears(centerCellObj, delta) {
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

function calculateXPosOfEventYears(groupTime, eventTime){
  var difference = moment(eventTime).diff(moment(groupTime),'days');
  var daysWidth = cellWidth / 365;
  return difference * daysWidth;
}

function changeOfLevelYears(lastLevel, centerCellObj){
  var center = mishGA.workAreaWidthHalf;
  if(lastLevel === "MONTHS"){
    var centerMonthMoment = moment('' + centerCellObj.idText, "MMYYYY");
    if(centerCellObj.negativeYear === true){
      centerMonthMoment.year(centerMonthMoment.year() * -1);
    }

    //Calculate the date to use as reference for drawing in YEARS

    //1. Calculate the size of each day in the month
    //This is done here to ensure that the width of the day is the same in all the cases
    var dayWidth = centerCellObj.groupWidth / centerMonthMoment.clone().endOf("month").date();

    //2. Get the distance from the X position of the month to the screen center
    var distanceToCenter = center - centerCellObj.posX;
    if(distanceToCenter < 0){
      //The calculation of the day will be made with the nearest month to the center from the left.
      //For that reason, if the distance is negative it is necessary to subtract a month
      centerCellObj.idText = centerMonthMoment.subtract(1, 'month').format("MMYYYY");
    }

    //3. Get the amount of days of the nearest month (from the LEFT) to the screen center
    var daysOfMonth = centerMonthMoment.clone().endOf("month").date();

    //4. Get the number of days contained in the distance to the center
    var numberOfDays = Math.ceil(Math.abs(distanceToCenter) / dayWidth);
    if(distanceToCenter < 0){
      //If the nearest month to the center is right to it, it is necessary to subtract the
      //number of days obtained to the number of days of the previous month
      numberOfDays = daysOfMonth - numberOfDays;
    }

    //5. Get the day of the year for the center date
    var referenceDateMoment = moment(((numberOfDays > 9) ? "" + numberOfDays : "0" + numberOfDays) + centerCellObj.idText, "DDMMYYYY");
    var dayOfYear = referenceDateMoment.dayOfYear();

    //6. Calculate the DECADE of the reference date
    var yearsFromDecade = referenceDateMoment.year() % 10;
    var decadeOfReferenceDate = referenceDateMoment.year() - yearsFromDecade;
    if(centerCellObj.negativeYear === true){
      decadeOfReferenceDate *= -1;
    }
    centerCellObj.idText = "0101" + decadeOfReferenceDate;

    //6. Get the amount of pixels from the first date of the obtained decade to the day of reference
    //6.1 Get the amount of pixels from the first day of the obtained decade to the first day of the year to which the reference date belongs
    var distanceToDecade = yearsFromDecade * cellWidth;

    //6.2 Add the amount of pixels to the day of reference
    distanceToDecade += ( dayOfYear * cellWidth/referenceDateMoment.clone().endOf("year").dayOfYear() );
    centerCellObj.posX = center - distanceToDecade;
  } else if(lastLevel === "DECADES"){
    var centerDecadeMoment = moment('' + centerCellObj.idText, "MMYYYY");
    if(centerCellObj.negativeYear === true){
      centerDecadeMoment.year(centerDecadeMoment.year() * -1);
    }

    //1. Get the width of each day
    var dayWidth = (centerCellObj.groupWidth / 10) / 365;

    //2. Get the distance from the screen center to the nearest cell to center
    var distanceToCenter = center - centerCellObj.posX;
    if(distanceToCenter < 0){
      //The calculation of the day will be made with the nearest year to the center from the left.
      //For that reason, if the distance is negative it is necessary to subtract a year
      centerDecadeMoment.subtract(10, 'year');
    }

    //3. Get the decade of reference for the reference date to use
    var decadeOfReference = centerDecadeMoment.year();
    centerCellObj.idText = "0101" + decadeOfReference;

    //4. Get the number of the year (within the decade) nearest to the center
    var yearNearestToCenter = Math.abs(distanceToCenter) / (centerCellObj.groupWidth / 10);
    if(distanceToCenter < 0){
      yearNearestToCenter = 10 - Math.ceil(yearNearestToCenter);
    }else{
      yearNearestToCenter = Math.floor(yearNearestToCenter);
    }
    centerDecadeMoment.add(yearNearestToCenter, "year");

    //5. Get the amount of days of the nearest year (from LEFT) to the screen center
    var daysOfYear = centerDecadeMoment.clone().endOf("year").dayOfYear();

    //6. Get the number of days contained in the distance to the center from the decade of reference
    var numberOfDays = 0;
    if(distanceToCenter < 0){
      numberOfDays = Math.floor((center - (centerCellObj.posX - centerCellObj.groupWidth)) / dayWidth);
    }else{
      numberOfDays = Math.floor(Math.abs(distanceToCenter) / dayWidth);
    }
    numberOfDays -= yearNearestToCenter * 365;

    //7. Get the amount of pixels from the first day of the obtained decade to the first day of the year to which the reference date belongs
    var distanceToDecade = yearNearestToCenter * cellWidth;

    //8. Add the amount of pixels to the day of reference
    distanceToDecade += ( numberOfDays * (cellWidth / daysOfYear) );
    centerCellObj.posX = center - distanceToDecade;

  }
}