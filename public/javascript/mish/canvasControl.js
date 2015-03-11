/**
 * Function that determines if Canvas is supported by the Web browser.
 *
 * @returns {Modernizr.canvas|Function.canvas}
 */
function canvasSupport() {
  return Modernizr.canvas;
}

/**
 * Function that creates the Canvas.
 *
 * @param {type} x
 * @param {type} y
 * @returns {undefined}
 */
function canvasApp(x, y) {
  if (!canvasSupport()) {
    return null;
  } else {

    //http://css-tricks.com/using-requestanimationframe/
    //http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
    window.requestAnimFrame = (function () {
      return function (/* function */ callback, /* DOMElement */ element) {
        window.setTimeout(callback, 1000 / 24);// 24 fps
      };

      // window.requestAnimationFrame ||
      // window.webkitRequestAnimationFrame ||
      // window.mozRequestAnimationFrame ||
      // window.oRequestAnimationFrame ||
      // window.msRequestAnimationFrame ||

    })();

    var _clearAndPause = function(){
      theCanvas.render = false;
      context.clearRect(0, 0, theCanvas.width, theCanvas.height);
    };

    var _continueRender = function(){
      theCanvas.render = true;
      drawFrame();
    };

    var theCanvas = document.getElementById('maincanvas');
    var context = theCanvas.getContext('2d');

    theCanvas.setAttribute("width", mishGA.workAreaWidth);
    theCanvas.setAttribute("height", mishGA.workAreaHeight);
    theCanvas.render = true;
    theCanvas.clearAndPause = _clearAndPause;
    theCanvas.continueRender = _continueRender;

    //setInterval(drawScreen, 1000 / 60);//60 FPS
    drawFrame();

    return theCanvas;
  }

  var mouseX;
  var mouseY;

  /**
   * Function that call the draw functions
   *
   * @returns {undefined}
   */
  function drawFrame() {
    requestAnimFrame(drawFrame);
    if(theCanvas.render === true){
      drawScreen();
    }
  }

  /**
   * Function that call all the draw functions
   *
   * @returns {undefined}
   */
  function drawScreen() {
    drawEvents();
    //Draw a dashed line in the center of the screen for nothing...
    //  drawLineToTimeline(jQuery(window).width() / 2,globalPosY);
  }

  /**
   * Function that draw the events in the canvas
   *
   * @returns {undefined}
   */
  function drawEvents() {
    //Clean the canvas for smooth lines
    context.clearRect(0, 0, theCanvas.width, theCanvas.height);

    mishJsonObjs.eventsJsonElement.forEach(function (eventObj) {
      if (eventObj.date) {
        //1. Search into which group the event's date fits
        var groupOfDate = findGroupOfEvent(eventObj.time);

        if (groupOfDate) {
          //2. Calculate the X position of the event
          var eventXPos = calculateXPosOfEvent(groupOfDate, eventObj);

          if (eventXPos) {
            drawLineToTimeline(eventXPos, globalPosY);
            drawEvent(eventXPos, globalPosY, eventObj.title);
            if(eventObj.imageElement){
              // var widthScale = 100 / eventObj.image.width;
              // var heightScale = 100 / eventObj.image.height;
              context.drawImage(eventObj.imageElement, eventXPos + 10, globalPosY + 6, 80, 80);
            }
          }
        }

      }
    });
  }

  function drawLineToTimeline(event_posX, event_posY) {
    if (event_posX < jQuery(window).width()
      && event_posX >= 0) {
      //Define the properties for the line to the timeline
      context.lineWidth = 1;
      context.lineCap = 'square';
      context.lineJoin = 'square';
      context.strokeStyle = "" + (timeline_color_scheme) ? timeline_color_scheme[0] : "#499AAF";
      context.setLineDash([5, 10]);

      //Draw the dashed line to de timeline
      context.beginPath();
      context.moveTo(event_posX, event_posY);
      context.lineTo(event_posX, event_posY + 2000);
      context.stroke();
      context.closePath();
    }
  }

  function drawEvent(event_posX, event_posY, event_text) {
    if (event_posX < jQuery(window).width()
        && event_posX >= 0) {
      //Define the properties of the event to draw
      context.font = "20px sans-serif";
      context.fillStyle = "" + (timeline_color_scheme) ? timeline_color_scheme[1] : "#499AAF";

      //Draw the title of the event
      context.fillText(event_text, event_posX + 20, event_posY + 3);

      //Draw the circle of the event
      context.fillStyle = "" + (timeline_color_scheme) ? timeline_color_scheme[1] : "#499AAF";
      context.lineWidth = 10;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.strokeStyle = "" + (timeline_color_scheme) ? timeline_color_scheme[1] : "#499AAF";
      context.fillStyle = "" + (timeline_color_scheme) ? timeline_color_scheme[1] : "#499AAF";
      context.setLineDash([0]);

      context.beginPath();
      context.arc(event_posX, event_posY, 5, 0, Math.PI * 2, false);
      context.fill();
      context.stroke();
      context.closePath();
    }
  }

  /*
   ----------------------------------------------------
   --------------------------------------------
   -----------------------------------
   --------------------------
   Mouse handle events
   */

  function onMouseMove(e) {
    mouseX = e.clientX - theCanvas.offsetLeft;
    mouseY = e.clientY - theCanvas.offsetTop;
  }

  function onMouseClick(e) {
    //var imageData = context.getImageData(mouseX,mouseY,10,10);
  }

  theCanvas.addEventListener("mousemove", onMouseMove, false);
  theCanvas.addEventListener("click", onMouseClick, false);
}