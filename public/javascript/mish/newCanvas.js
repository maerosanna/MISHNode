function createPixiCanvas(){
  // create an new instance of a pixi stage
  mishGA.stage = new PIXI.Stage(0xFAFAFA);
  // mishGA.stage.setInteractionDelegate(document.getElementById("work-area-handler-sq"));
  // mishGA.stage.setInteractionDelegate(document.getElementById("work-area-container"));

  // create a renderer instance.
  // mishGA.renderer = PIXI.autoDetectRenderer(mishGA.workAreaWidth, mishGA.workAreaHeight);
  mishGA.renderer = new PIXI.CanvasRenderer (mishGA.workAreaWidth, mishGA.workAreaHeight, {
    view: document.getElementById("maincanvas"),
    clearBeforeRender: true,
    antialias: true
  });

  // add the renderer view element to the DOM
  // document.body.appendChild(mishGA.renderer.view);
  // document.getElementById("canvas-container").appendChild(mishGA.renderer.view);
  requestAnimFrame( animate );
  mishGA.stage.setInteractionDelegate(document.getElementById("work-area-container"));
}

function animate() {
  requestAnimFrame( animate );

  // Add events to Stage
  addEventsToStage();

  // render the stage
  mishGA.renderer.render(mishGA.stage);
}

function addEventsToStage(){
  // mishGA.stage.removeChildren();

  mishJsonObjs.eventsJsonElement.forEach(function (eventObj) {
    if (eventObj.date && (!eventObj.rendered || eventObj.rendered === false)) {
      eventObj.rendered = true;
      //1. Search into which group the event's date fits
      var groupOfDate = findGroupOfEvent(eventObj.time);

      if (groupOfDate) {
        //2. Calculate the X position of the event
        var eventXPos = calculateXPosOfEvent(groupOfDate, eventObj);


        drawEventLine(eventXPos, globalPosY);
        if (eventXPos) {
          if(eventObj.imageElement){
            // create a texture from an image path
            var texture = PIXI.Texture.fromImage(eventObj.imageElement.src);
            var bunny = new PIXI.Sprite(texture);

            // bunny.anchor.x = 0.5;
            // bunny.anchor.y = 0.5;
            bunny.eventName = eventObj.title;
            bunny.eventDescription = eventObj.description;
            bunny.position.x = eventXPos + 5;
            bunny.position.y = globalPosY + 5;
            bunny.width = 80;
            bunny.height = 80;
            bunny.interactive = true;
            
            bunny.mouseup = function(mouseData){
              showAlertMessage(false, "Hizo click en el evento " + this.eventName);
            };

            bunny.mouseover = function(mouseData){
              var textStyle = {
                font: "16px Sans-Serif",
                fill: "#499AAF",
                align: "center"
              };
              var eventDesc = new PIXI.Text(this.eventDescription, textStyle);
              eventDesc.x = this.x + this.width + 5;
              eventDesc.y = this.y;
              mishGA.stage.addChild(eventDesc);
            };

            mishGA.stage.addChild(bunny);
          }
        }
        drawEventPoint(eventXPos, globalPosY, eventObj.title);


      }
    }
  });
}

function drawEventLine(event_posX, event_posY) {
  if (event_posX < jQuery(window).width()
      && event_posX >= 0) {

    /*
    //Define the properties for the line to the timeline
    mishGA.renderer.context.lineWidth = 1;
    mishGA.renderer.context.lineCap = 'square';
    mishGA.renderer.context.lineJoin = 'square';
    mishGA.renderer.context.strokeStyle = "" + (timeline_color_scheme) ? timeline_color_scheme[0] : "#499AAF";
    mishGA.renderer.context.setLineDash([5, 10]);

    //Draw the dashed line to de timeline
    mishGA.renderer.context.beginPath();
    mishGA.renderer.context.moveTo(event_posX, event_posY);
    mishGA.renderer.context.lineTo(event_posX, event_posY + 2000);
    mishGA.renderer.context.stroke();
    mishGA.renderer.context.closePath();
    */

    var eventLine = new PIXI.Graphics();
    eventLine.lineStyle(1, 0x499AAF, 1);
    eventLine.moveTo(event_posX, event_posY);
    eventLine.lineTo(event_posX, event_posY + 2000);
    mishGA.stage.addChild(eventLine);
  }
}

function drawEventPoint(event_posX, event_posY, event_text) {
  if (event_posX < jQuery(window).width()
      && event_posX >= 0) {
    /*
    //Define the properties of the event to draw
    mishGA.renderer.context.font = "20px sans-serif";
    mishGA.renderer.context.fillStyle = "" + (timeline_color_scheme) ? timeline_color_scheme[1] : "#499AAF";

    //Draw the title of the event
    mishGA.renderer.context.fillText(event_text, event_posX + 20, event_posY + 3);

    //Draw the circle of the event
    mishGA.renderer.context.fillStyle = "" + (timeline_color_scheme) ? timeline_color_scheme[1] : "#499AAF";
    mishGA.renderer.context.lineWidth = 10;
    mishGA.renderer.context.lineCap = 'round';
    mishGA.renderer.context.lineJoin = 'round';
    mishGA.renderer.context.strokeStyle = "" + (timeline_color_scheme) ? timeline_color_scheme[1] : "#499AAF";
    mishGA.renderer.context.fillStyle = "" + (timeline_color_scheme) ? timeline_color_scheme[1] : "#499AAF";
    mishGA.renderer.context.setLineDash([0]);

    mishGA.renderer.context.beginPath();
    mishGA.renderer.context.arc(event_posX, event_posY, 5, 0, Math.PI * 2, false);
    mishGA.renderer.context.fill();
    mishGA.renderer.context.stroke();
    mishGA.renderer.context.closePath();
    */
   
    var textStyle = {
      font: "20px Sans-Serif",
      fill: "#499AAF",
      align: "center"
    };
    var eventText = new PIXI.Text(event_text, textStyle);

    eventText.x = event_posX;
    eventText.y = event_posY - 15;

    eventText.anchor.x = 0.5;
    eventText.anchor.y = 0.5;

    var eventCircle = new PIXI.Graphics();
    eventCircle.beginFill(0x499AAF);
    eventCircle.arc(event_posX, event_posY, 10, 0, Math.PI * 2, false);
    eventCircle.endFill();

    mishGA.stage.addChild(eventCircle);
    mishGA.stage.addChild(eventText);
  }
}