/**
 * Function to handle the mouse events.
 *
 * @returns {undefined}
 */
function assignMouseEventsListeners() {
  var wah = document.getElementById("work-area-handler-sq");
  if (wah.addEventListener) {
    //IE9, Chrome, Safari, Opera
    wah.addEventListener("mousewheel", mouseScrollEvent, false);
    //Firefox
    wah.addEventListener("DOMMouseScroll", mouseScrollEvent, false);
  } else {
    //Others
    wah.attachEvent("onmousewheel", mouseScrollEvent);
  }

  //Assign behavior for showing and hiding the context menu
  jQuery("#work-area-handler-sq").bind("click", function (e) {
    jQuery("#canvasContextMenu").hide("fade", 200);
    return false;
  });
  jQuery("#work-area-handler-sq").bind("contextmenu", function (e) {
    jQuery("#canvasContextMenu").hide();
    jQuery("#canvasContextMenu").css('left', e.clientX);
    jQuery("#canvasContextMenu").css('top', e.clientY);
    jQuery("#canvasContextMenu").show("fade", 200);
    return false;
  });

  //Assign behavior of dragging the work area
  jQuery('#work-area-handler').draggable({
    axis: 'x',
    scroll: false,
    drag: function (event, ui) {
      var lastTimerulerXPos = jQuery('#timeline-container').position().left;
      mishGA.timeRulerXPos = parseInt(jQuery(this).position().left);
      jQuery('#timeline-container').css({left: (mishGA.timeRulerXPos) + "px"});

      var evaluateAdditionToRight = (lastTimerulerXPos > mishGA.timeRulerXPos)
        ? true
        : ( (lastTimerulerXPos < mishGA.timeRulerXPos)
          ? false
          : null );

      if (evaluateAdditionToRight !== null) {
        mishGA.zoomData.addGroupToTimeruler(evaluateAdditionToRight);
      }
    },
    stop: function (event, ui) {
      var leftAmount = 0 - parseInt(jQuery(this).position().left);
      jQuery('#work-area-handler-sq').css({left: leftAmount});
    }
  });
}

/**
 * Function called when the mouse wheel moves.
 *
 * @param {type} e
 * @returns {undefined}
 */
function mouseScrollEvent(e) {
  //cross-browser wheel delta
  var e = window.event || e; //old IE support
  var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail))) * (mishGA.zoomData.deltaMultiplier || 1);

  var zoomSubLevelChange = false;
  var zoomLevelChange = false;

  mishGA.lastZoomLevelName = mishGA.zoomData.name;

  zoom_level += delta / Math.abs(delta);

  cellWidth += delta;
  mishGA.zoomData = getZoomData();

  if(mishGA.zoomData.isTheLast === true){
    cellWidth -= delta;
    return;
  }

  if (mishGA.zoomData.id !== mishGA.currentZoomSubLevel
    || mishGA.zoomData.parentId !== mishGA.currentZoomLevel) {
    //The zoom SUB-LEVEL changes, do something!
    zoomSubLevelChange = true;

    if (mishGA.zoomData.id === 'PREV') {
      //It's time to change the zoom LEVEL
      zoomLevelChange = true;

      mishGA.currentZoomLevel--;
      mishGA.currentZoomSubLevel = zoomSubLevels[zoomLevels[mishGA.currentZoomLevel]].lastSubLevel;
      cellWidth = null;
      mishGA.zoomData = getZoomData();
    } else if (mishGA.zoomData.id === 'NEXT') {
      //The zoom LEVEL changes, do something
      zoomLevelChange = true;

      //It's time to change the Zoom LEVEL
      mishGA.currentZoomLevel++;
      mishGA.currentZoomSubLevel = zoomSubLevels[zoomLevels[mishGA.currentZoomLevel]].initialSubLevel;
      cellWidth = null;
      mishGA.zoomData = getZoomData();
    }

    mishGA.currentZoomSubLevel = mishGA.zoomData.id;
    mishGA.currentZoomLevel = mishGA.zoomData.parentId;

    if (delta > 0) {
      cellWidth = mishGA.zoomData.initialCellWidth;
    } else {
      cellWidth = mishGA.zoomData.lastCellWidth;
    }
  }

  var centerCellObj = findNearestCellToCenter();
  // console.log("centerCellObj", centerCellObj);

  if (zoomSubLevelChange) {
    if (zoomLevelChange) {
      mishGA.zoomData.changeOfLevel(mishGA.lastZoomLevelName, centerCellObj);
      clearTimeline();
    }

    //Create a moment with the date of the nearest cell to the center
    var nearestCellToCenterDate = moment('' + centerCellObj.idText, "DDMMYYYY");

    //Call the function that fill the time ruler
    mishGA.zoomData.fillTimeRuler(nearestCellToCenterDate, centerCellObj.posX);
  } else {
    //Call the function that zoom the time ruler
    mishGA.zoomData.zoomTimeRuler(centerCellObj, delta);
  }

}