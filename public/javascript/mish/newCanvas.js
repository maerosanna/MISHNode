var titleStyle = {
  font: "20px Sans-Serif",
  fill: "#499AAF",
  align: "center"
};

var descStyle = {
  font: "16px Sans-Serif",
  fill: "#499AAF",
  align: "center"
};

function createPixiCanvas(){
  // create an new instance of a pixi stage
  mishGA.stage = new PIXI.Stage(0xFFFFFF);

  // create a renderer instance.
  mishGA.renderer = new PIXI.CanvasRenderer (mishGA.workAreaWidth, mishGA.workAreaHeight, {
    view: document.getElementById("maincanvas"),
    clearBeforeRender: true,
    antialias: true
  });

  mishGA.stage.setInteractionDelegate(document.getElementById("work-area-container"));
  requestAnimFrame(animate);
}

function animate() {
  requestAnimFrame(animate);

  //Add events to Stage
  addEventsToStage();

  //Render the stage
  mishGA.renderer.render(mishGA.stage);
}

function addEventsToStage(){
  mishJsonObjs.eventsJsonElement.forEach(function (eventObj) {
    if (eventObj.date) {
      //1. Search into which group the event's date fits
      var groupOfDate = findGroupOfEvent(eventObj.time);

      if (groupOfDate) {
        //2. Calculate the X position of the event
        var eventXPos = calculateXPosOfEvent(groupOfDate, eventObj);
        if(eventXPos < mishGA.workAreaWidth
            && eventXPos >= 0){
          if(!eventObj.rendered || eventObj.rendered === false){
            eventObj.rendered = true;
            eventObj.rendereables = {};

            //Draw the line from the time ruler
            eventObj.rendereables.line = drawEventLine(eventXPos, globalPosY);

            //Draw the event point
            eventObj.rendereables.point = drawEventPoint(eventXPos, globalPosY);

            //Draw the event title
            eventObj.rendereables.title = drawEventTitle(eventXPos, globalPosY, eventObj.title);

            //Draw the image of the event
            if(eventObj.imageElement){
              eventObj.rendereables.image = drawEventImage(eventXPos, globalPosY, eventObj.imageElement.src);
              eventObj.rendereables.image.parentEvent = eventObj;
            }
          }else if(eventObj.rendered === true){
            //Update the X position of the elements of the event
            eventObj.rendereables.line.clear();
            eventObj.rendereables.line.lineStyle(1, 0x499AAF, 1);
            eventObj.rendereables.line.moveTo(eventXPos, globalPosY);
            eventObj.rendereables.line.lineTo(eventXPos, globalPosY + 2000);

            eventObj.rendereables.point.clear();
            eventObj.rendereables.point.beginFill(0x499AAF);
            eventObj.rendereables.point.arc(eventXPos, globalPosY, 10, 0, Math.PI * 2, false);
            eventObj.rendereables.point.endFill();

            eventObj.rendereables.title.x = eventXPos - eventObj.rendereables.title.width / 2;
            if(eventObj.rendereables.image){
              eventObj.rendereables.image.x = eventXPos + 5;
            }
          }

        }

      }
    }
  });
}

function drawEventLine(event_posX, event_posY) {
  var eventLine = new PIXI.Graphics();
  eventLine.lineStyle(1, 0x499AAF, 1);
  eventLine.moveTo(event_posX, event_posY);
  eventLine.lineTo(event_posX, event_posY + 2000);
  mishGA.stage.addChild(eventLine);
  return eventLine;
}

function drawEventPoint(event_posX, event_posY) {
  var eventCircle = new PIXI.Graphics();
  eventCircle.beginFill(0x499AAF);
  eventCircle.arc(event_posX, event_posY, 10, 0, Math.PI * 2, false);
  eventCircle.endFill();
  mishGA.stage.addChild(eventCircle);
  return eventCircle;
}

function drawEventTitle(event_posX, event_posY, event_title) {
  var eventText = new PIXI.Text(event_title, titleStyle);
  eventText.x = event_posX - eventText.width / 2;
  eventText.y = event_posY - 30;
  mishGA.stage.addChild(eventText);
  return eventText;
}

function drawEventImage(event_posX, event_posY, event_image){
  // create a texture from an image path
  var texture = PIXI.Texture.fromImage(event_image);
  var eventImage = new PIXI.Sprite(texture);

  eventImage.position.x = event_posX + 5;
  eventImage.position.y = event_posY + 5;
  eventImage.width = 80;
  eventImage.height = 80;
  eventImage.interactive = true;
  
  eventImage.mousedown = function(mouseData){
    showAlertMessage(false, "Hizo click en el evento: " + this.parentEvent.title);
    return;
  };

  eventImage.mouseover = function(mouseData){
    if(!this.parentEvent.rendereables.description){
      this.parentEvent.rendereables.description = new PIXI.Text(this.parentEvent.description, descStyle);
      this.parentEvent.rendereables.description.x = this.x + this.width + 5;
      this.parentEvent.rendereables.description.y = this.y;
      mishGA.stage.addChild(this.parentEvent.rendereables.description);
    }else{
      this.parentEvent.rendereables.description.x = this.x + this.width + 5;
      this.parentEvent.rendereables.description.visible = true;
    }
    return;
  };

  eventImage.mouseout = function(mouseData){
    if(this.parentEvent.rendereables.description){
      this.parentEvent.rendereables.description.visible = false;
    }
    return;
  };

  mishGA.stage.addChild(eventImage);
  return eventImage;
}