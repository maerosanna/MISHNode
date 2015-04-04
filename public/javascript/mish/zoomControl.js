var zoomLevels = {
  1: "ERA",
  2: "MILLENNIUM",
  3: "CENTURY",
  4: "DECADE",
  5: "YEAR",
  6: "MONTH",
  7: "DAY",
  8: "HOUR"
};

var zoomSubLevels = {
  "ERA": {},
  "MILLENNIUM": {},
  "CENTURY": {
    1: {
      id: 1,
      name: 'DECADES',
      parentId: 3,
      deltaMultiplier: 20,
      initialCellWidth: 50,
      lastCellWidth: 450,
      isTheLast: false,
      fillTimeRuler: function (nearestCellToCenterDate, nearestCellToCenterPosX) {
        fillTimeRulerDecades(nearestCellToCenterDate, nearestCellToCenterPosX);
      },
      zoomTimeRuler: function (nearestCellToCenterObj, mouseScrollDelta) {
        zoomTimeRulerDecades(nearestCellToCenterObj, mouseScrollDelta);
      },
      addGroupToTimeruler: function (evaluateAdditionToRight) {
        addGroupToTimerulerDecades(evaluateAdditionToRight);
      },
      calculateXPosOfEvent: function (groupTime,eventTime) {
        return calculateXPosOfEventDecades(groupTime,eventTime);
      },
      changeOfLevel: function(lastLevel, centerCellObj){
        changeOfLevelDecades.call(this, lastLevel, centerCellObj);
      }
    }, 2: {
      id: 'NEXT',
      parentId: 3,
      initialCellWidth: 61,
      lastCellWidth: 61
    },
    $scrollAmount: 0,
    $currentSubLevel: 0,
    initialSubLevel: 1,
    lastSubLevel: 1
    , get zoomSubLevel() {
      return this[this.$currentSubLevel];
    }
    , set currentSubLevel(levelID) {
      this.$currentSubLevel = levelID;
    }, set scrollAmount(newScrollAmount) {
      var lastScrollAmount = this.$scrollAmount;
      this.$scrollAmount = newScrollAmount;
      this[this.$currentSubLevel].isTheLast = false;

      if (this.$scrollAmount < this[this.$currentSubLevel].initialCellWidth) {
        if(this[this.$currentSubLevel - 1]){
          this.$currentSubLevel--;
        }else{
          this[this.$currentSubLevel].isTheLast = true;
          this.$scrollAmount = lastScrollAmount;
        }
      } else if (this.$scrollAmount > this[this.$currentSubLevel].lastCellWidth) {
        if(this[this.$currentSubLevel + 1]){
          this.$currentSubLevel++;
        }else{
          this[this.$currentSubLevel].isTheLast = true;
          this.$scrollAmount = lastScrollAmount;
        }
      }
    }
  },
  "DECADE": {
    0: {
      id: 'PREV',
      parentId: 4
    },
    1: {
      id: 1,
      name: 'YEARS',
      parentId: 4,
      deltaMultiplier: 15,
      initialCellWidth: 45,
      lastCellWidth: 360,
      isTheLast: false,
      fillTimeRuler: function (nearestCellToCenterDate, nearestCellToCenterPosX) {
        fillTimeRulerYears(nearestCellToCenterDate, nearestCellToCenterPosX);
      },
      zoomTimeRuler: function (nearestCellToCenterObj, mouseScrollDelta) {
        zoomTimeRulerYears(nearestCellToCenterObj, mouseScrollDelta);
      },
      addGroupToTimeruler: function (evaluateAdditionToRight) {
        addGroupToTimerulerYears(evaluateAdditionToRight);
      },
      calculateXPosOfEvent: function (groupTime,eventTime) {
        return calculateXPosOfEventYears(groupTime,eventTime);
      },
      changeOfLevel: function(lastLevel, centerCellObj){
        changeOfLevelYears.call(this, lastLevel, centerCellObj);
      }
    }, 2: {
      id: 'NEXT',
      parentId: 4
    },
    $scrollAmount: 0,
    $currentSubLevel: 0,
    initialSubLevel: 1,
    lastSubLevel: 1
    , get zoomSubLevel() {
      return this[this.$currentSubLevel];
    }
    , set currentSubLevel(levelID) {
      this.$currentSubLevel = levelID;
    }, set scrollAmount(newScrollAmount) {
      var lastScrollAmount = this.$scrollAmount;
      this.$scrollAmount = newScrollAmount;
      this[this.$currentSubLevel].isTheLast = false;

      if (this.$scrollAmount < this[this.$currentSubLevel].initialCellWidth) {
        if(this[this.$currentSubLevel - 1]){
          this.$currentSubLevel--;
        }else{
          this[this.$currentSubLevel].isTheLast = true;
          this.$scrollAmount = lastScrollAmount;
        }
      } else if (this.$scrollAmount > this[this.$currentSubLevel].lastCellWidth) {
        if(this[this.$currentSubLevel + 1]){
          this.$currentSubLevel++;
        }else{
          this[this.$currentSubLevel].isTheLast = true;
          this.$scrollAmount = lastScrollAmount;
        }
      }
    }
  },
  "YEAR": {
    0: {
      id: 'PREV',
      parentId: 5
    },
    1: {
      id: 1,
      name: 'MONTHS',
      parentId: 5,
      deltaMultiplier: 10,
      initialCellWidth: 30,
      lastCellWidth: 270,
      isTheLast: false,
      fillTimeRuler: function (nearestCellToCenterDate, nearestCellToCenterPosX) {
        fillTimeRulerMonths(nearestCellToCenterDate, nearestCellToCenterPosX);
      },
      zoomTimeRuler: function (nearestCellToCenterObj, mouseScrollDelta) {
        zoomTimeRulerMonths(nearestCellToCenterObj, mouseScrollDelta);
      },
      addGroupToTimeruler: function (evaluateAdditionToRight) {
        addGroupToTimerulerMonths(evaluateAdditionToRight);
      },
      calculateXPosOfEvent: function (groupTime,eventTime) {
        return calculateXPosOfEventMonths(groupTime,eventTime);
      },
      changeOfLevel: function(lastLevel, centerCellObj){
        changeOfLevelMonths.call(this, lastLevel, centerCellObj);
      }
    }, 2: {
      id: 'NEXT',
      parentId: 5
    },
    $scrollAmount: 0,
    $currentSubLevel: 0,
    initialSubLevel: 1,
    lastSubLevel: 1
    , get zoomSubLevel() {
      return this[this.$currentSubLevel];
    }
    , set currentSubLevel(levelID) {
      this.$currentSubLevel = levelID;
    }, set scrollAmount(newScrollAmount) {
      var lastScrollAmount = this.$scrollAmount;
      this.$scrollAmount = newScrollAmount;
      this[this.$currentSubLevel].isTheLast = false;

      if (this.$scrollAmount < this[this.$currentSubLevel].initialCellWidth) {
        if(this[this.$currentSubLevel - 1]){
          this.$currentSubLevel--;
        }else{
          this[this.$currentSubLevel].isTheLast = true;
          this.$scrollAmount = lastScrollAmount;
        }
      } else if (this.$scrollAmount > this[this.$currentSubLevel].lastCellWidth) {
        if(this[this.$currentSubLevel + 1]){
          this.$currentSubLevel++;
        }else{
          this[this.$currentSubLevel].isTheLast = true;
          this.$scrollAmount = lastScrollAmount;
        }
      }
    }
  },
  "MONTH": {
    0: {
      id: 'PREV',
      parentId: 6
    },
    1: {
      id: 1,
      name: 'WEEKS',
      parentId: 6,
      initialCellWidth: 10,
      lastCellWidth: 20,
      isTheLast: false,
      fillTimeRuler: function (nearestCellToCenterDate, nearestCellToCenterPosX) {
        fillTimeRulerWeeks(nearestCellToCenterDate, nearestCellToCenterPosX);
      },
      zoomTimeRuler: function (nearestCellToCenterObj, mouseScrollDelta) {
        zoomTimeRulerWeeks(nearestCellToCenterObj, mouseScrollDelta);
      },
      addGroupToTimeruler: function (evaluateAdditionToRight) {
        addGroupToTimerulerWeeks(evaluateAdditionToRight);
      },
      calculateXPosOfEvent: function (groupTime,eventTime) {
        return calculateXPosOfEventWeeks(groupTime,eventTime);
      },
      changeOfLevel: function(lastLevel, centerCellObj){
        changeOfLevelWeeks.call(this, lastLevel, centerCellObj);
      }
    },
    2: {
      id: 2,
      name: 'DAYS',
      parentId: 6,
      initialCellWidth: 20,
      lastCellWidth: 50,
      isTheLast: false,
      fillTimeRuler: function (nearestCellToCenterDate, nearestCellToCenterPosX) {
        fillTimeRulerDays(nearestCellToCenterDate, nearestCellToCenterPosX);
      },
      zoomTimeRuler: function (nearestCellToCenterObj, mouseScrollDelta) {
        zoomTimeRulerDays(nearestCellToCenterObj, mouseScrollDelta);
      },
      addGroupToTimeruler: function (evaluateAdditionToRight) {
        addGroupToTimerulerDays(evaluateAdditionToRight);
      },
      calculateXPosOfEvent: function (groupTime,eventTime) {
        return calculateXPosOfEventDays(groupTime,eventTime);
      },
      changeOfLevel: function(lastLevel, centerCellObj){
        changeOfLevelDays.call(this, lastLevel, centerCellObj);
      }
    },
    $scrollAmount: 0,
    $currentSubLevel: 0,
    initialSubLevel: 1,
    lastSubLevel: 2,
    get zoomSubLevel() {
      return this[this.$currentSubLevel];
    },
    set currentSubLevel(levelID) {
      this.$currentSubLevel = levelID;
    },
    set scrollAmount(newScrollAmount) {
      var lastScrollAmount = this.$scrollAmount;
      this.$scrollAmount = newScrollAmount;
      this[this.$currentSubLevel].isTheLast = false;

      if (this.$scrollAmount < this[this.$currentSubLevel].initialCellWidth) {
        if(this[this.$currentSubLevel - 1]){
          this.$currentSubLevel--;
        }else{
          this[this.$currentSubLevel].isTheLast = true;
          this.$scrollAmount = lastScrollAmount;
        }
      } else if (this.$scrollAmount > this[this.$currentSubLevel].lastCellWidth) {
        if(this[this.$currentSubLevel + 1]){
          this.$currentSubLevel++;
        }else{
          this[this.$currentSubLevel].isTheLast = true;
          this.$scrollAmount = lastScrollAmount;
        }
      }
    }
  },
  "DAY": {},
  "HOUR": {}
};

/**
 * Function that return the Object for the current Zoom level.
 *
 * @returns {*}
 */
function getZoomData() {
  var zoomSubLevelObj = zoomSubLevels[zoomLevels[mishGA.currentZoomLevel]];
  if (cellWidth === null
    || cellWidth === undefined) {
    zoomSubLevelObj.currentSubLevel = mishGA.currentZoomSubLevel;
  } else {
    zoomSubLevelObj.scrollAmount = cellWidth;
  }
  return zoomSubLevelObj.zoomSubLevel;
}