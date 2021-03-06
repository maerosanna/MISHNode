/**
 * Function that fill the time ruler
 *
 * @param {momnet} dateOfReference
 * @returns {undefined}
 */
function fillTimeRulerCenturies(dateOfReference, xPosDiff) {
  //Calculate the center of the window
  var center = mishGA.workAreaWidthHalf;

  if (xPosDiff !== null) {
    center -= center - xPosDiff;
  }

  //Draw all the groups of the time ruler:
  //1. Calculate the x position for the first group ('center' will be used in this operation)
  //2. Loop from 10 MILLENIUMS before the center date till 10 MILLENIUMS after the center date

  var firstGroupDate = dateOfReference.clone().subtract(10000, "years");//10 MILLENIUMS behind

  var centuriesFromFirstGroup = 100;
  var initialXPos = ((( (centuriesFromFirstGroup + dateOfReference.date()) * cellWidth) - cellWidth) * -1) + (center);

  var groupToDraw = firstGroupDate.clone().startOf("year");
  var xPositionOfGroup = initialXPos - mishGA.timeRulerXPos;

  if (mishGA.timeRulerGroups.length === 0) {
    for (var i = 0; i <= 20; i++) {
      var widthOfGroup = 10 * cellWidth;//A MILLENIUM has 10 CENTURIES...

      fillDateRangeCenturies(1,//begin: All years start with 1
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
      groupToDraw.add(1000, "year");
    }
  } else {
    mishGA.timeRulerGroups.forEach(function (value, index) {
      //Remove the cells in the group
      value.children('.date').remove();

      var groupID = 'mish-cellsGroup-' + groupToDraw.format('MMYYYY') + '-' + (index + 1);
      var widthOfGroup = 10 * cellWidth;//A MILLENIUM has 10 CENTURIES...

      value.attr('id', groupID);
      value.width(widthOfGroup);
      value.css('left', xPositionOfGroup);

      fillDateRangeCenturies(1,//begin: All months start with 1
        10,//end
        0,//xPos
        groupToDraw,//startDate
        true,//drawSeparator
        groupID//groupID
      );

      xPositionOfGroup += widthOfGroup;
      groupToDraw.add(1000, "year");
    });
  }
}

/**
 * Function to Determine if it is necessary to add a block of cells to the time ruler.
 *
 * @param {boolean} evaluateAdditionToRight Determines the side to evaluate for the possible addition of a group
 */
function addGroupToTimerulerCenturies(evaluateAdditionToRight) {
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
      var newGroupDate = moment(jQuery(lastDateOfTimeRuler.children('.date')[0]).attr('id').split('-')[1], "MMYYYY").add(1000, "year");

      //2. Get the X position for the first date of the new group
      var widthOfNewGroup = 10 * cellWidth;
      var xPosNewLastDate = xPosLastDate + lastDateOfTimeRuler.width();

      //3. Create the new group of cells)
      fillDateRangeCenturies(1,//begin: All months start with 1
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
      var newGroupDate = moment(jQuery(firstDateOfTimeRuler.children('.date')[0]).attr('id').split('-')[1], "MMYYYY").subtract(1000, "year");

      //2. Get the X position for the first date of the new group
      var widthOfNewGroup = 10 * cellWidth;
      var xPosNewFirstDate = xPosFirstDate - widthOfNewGroup;

      //3. Create the new group of cells)
      fillDateRangeCenturies(1,//begin: All months start with 1
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
function fillDateRangeCenturies(begin, end, xPos, startDate, drawSeparator, groupID) {
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
    yearsToAdd+=100;
    xPos = xPos + cellWidth;
  }
}

/**
 * Function that changes the WIDTHS and X positions of all the cells in the time ruler
 *
 * @param centerCellObj
 * @param delta
 */
function zoomTimeRulerCenturies(centerCellObj, delta) {
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

function calculateXPosOfEventCenturies(groupTime, eventTime){
  var difference = moment(eventTime).diff(moment(groupTime), 'days');
  var daysWidth = (cellWidth/100) / 365;// each cell represents 100 years, and each year has 365 days
  return difference * daysWidth;
}

function changeOfLevelCenturies(lastLevel, centerCellObj){
  var center = mishGA.workAreaWidthHalf;
  if(lastLevel === "DECADES"){
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

    //3. Get the number of the year (within the decade) nearest to the center
    var yearNearestToCenter = Math.abs(distanceToCenter) / (centerCellObj.groupWidth / 10);
    if(distanceToCenter < 0){
      yearNearestToCenter = 10 - Math.ceil(yearNearestToCenter);
    }else{
      yearNearestToCenter = Math.floor(yearNearestToCenter);
    }
    centerDecadeMoment.add(yearNearestToCenter, "year");

    //4. Get the decade of reference for the reference date to use
    var yearsFromMillenium = centerDecadeMoment.year() % 1000;
    var milleniumOfReference = centerDecadeMoment.year() - yearsFromMillenium;
    centerCellObj.idText = "0101" + milleniumOfReference;

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

    var distanceToMillenium = yearsFromMillenium * cellWidth / 100;
    distanceToMillenium += numberOfDays * ( (cellWidth/100) / 365 );
    centerCellObj.posX = center - distanceToMillenium;
  }
}