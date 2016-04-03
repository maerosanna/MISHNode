var Mish = Mish || {};

Mish.Event = function(storeableData, containerGroup, x, y, renderer){
  this.storeableData = storeableData;
  this.containerGroup = containerGroup;
  this.x = x;
  this.y = y;
  this.renderer = renderer;
  this.layer = renderer.layer;
  this.imageElement = null;
  this.imageWidth = 80;
  this.detailElement = null;
  this.positionRelativeToEvents = null;
  this.hideImage = false;
  
  this.draw = false;
  this.mouseOver = false;
  this.descAlpha = {
    alpha: 0
  };
  this.descTween = null;
  this.width = 0;
  this.titleMetrics = null;
};

//Definition of constructor
//  Mish.Event.prototype = Object.create();
Mish.Event.prototype.constructor = Mish.Event;

Mish.Event.prototype.set = function(attr, value){
  this[attr] = value;
};

/**
 * Function executed when the renderer steps...
 * 
 */
Mish.Event.prototype.step = function(){
  this.containerGroup = findGroupOfEvent(this.storeableData.time, this.storeableData.isBC);
  if(this.containerGroup){
    this.x = calculateXPosOfEvent(this.containerGroup, this.storeableData);
  }

  if (this.containerGroup &&
      this.x < mishGA.workAreaWidth &&
      this.x >= 0 &&
      this.storeableData.deleted !== true) {
    this.draw = true;

    //Calculate the Y position of the event based on its proximity to
    //other events
    if(this.positionRelativeToEvents > 0){
      //Get the event to the left
      var leftEvent = supermish.timelineEvents[this.positionRelativeToEvents - 1];
      if(leftEvent.draw === true && this.draw === true
          && leftEvent.x + leftEvent.width > this.x - 5){
        //The event to the left is close
        //1. Hide the image of the event
        leftEvent.hideImage = true;

        //2. Down my Y position
        this.y = globalPosY + 30 * this.positionRelativeToEvents;
        //    this.hideImage = true;
      }else{
        if(this.positionRelativeToEvents === 1){
          leftEvent.hideImage = false;
        }
        this.hideImage = false;
        this.y = globalPosY;
      }
    }
  }
  else {
    this.draw = false;
    if(this.detailElement){
      this.detailElement.hide("fade");
    }
  }
};

/**
 * Function that renders all the information of the event.
 * 
 */
Mish.Event.prototype.render = function(){
  if (this.draw === true) {
    this.drawLine();
    this.drawPoint();
    this.drawTitle();
    this.drawDate();
    if (this.imageElement) {
      this.drawImage();
    }

    this.drawDescription();

    //Move the DIV element if exists
    if (this.detailElement) {
      this.detailElement.css({
        left: this.x
      });
    }
  }
};

Mish.Event.prototype.drawLine = function(){
  this.layer.context.lineWidth = 1;
  this.layer.context.lineCap = 'square';
  this.layer.context.lineJoin = 'square';
  this.layer.context.strokeStyle = "#499AAF";
  this.layer.context.setLineDash([5, 10]);

  //Draw the dashed line to de timeline
  this.layer.context.beginPath();
  this.layer.context.moveTo(this.x, this.y);
  this.layer.context.lineTo(this.x, mishGA.workAreaHeight);
  this.layer.context.stroke();
  this.layer.context.closePath();
};

Mish.Event.prototype.drawPoint = function(){
  //Draw the circle of the event
  this.layer.fillStyle("#499AAF")
            .beginPath()
            .circle(this.x, this.y, 10)
            .fill();
};

Mish.Event.prototype.drawTitle = function(){
  //Define the properties of the event title to draw
  this.layer.context.font = "20px sans-serif";
  this.layer.context.fillStyle = "#499AAF";

  //Draw the title of the event
  this.layer.context.fillText(this.storeableData.title, this.x + 20, this.y + 6);
  if(!this.titleMetrics){
    this.titleMetrics = this.layer.context.measureText(this.storeableData.title);
  }

  this.width = 20 + this.titleMetrics.width + 10;
};

Mish.Event.prototype.drawDate = function(){
  //Define the properties of the event date to draw
  this.layer.context.font = "12px sans-serif";
  this.layer.context.fillStyle = "#346D7C";

  //Draw the title of the event
  this.layer.context.fillText(this.storeableData.date, this.x + 20, this.y + 18);
};

Mish.Event.prototype.drawImage = function(){
  if(this.hideImage === false){
    this.layer.context.drawImage(this.imageElement, this.x + 20, this.y + 26, this.imageWidth, this.imageWidth);
    if(this.width < this.imageWidth + 20){
      this.width = this.imageWidth + 20;
    }
  }
};

Mish.Event.prototype.drawDescription = function(){
  this.layer.save();
  this.layer.a(this.descAlpha.alpha);
  this.layer.fillStyle("#BC6180").font("18px sans-serif");
  this.layer.fillText("Clic para ver más", this.x + ((this.imageElement) ? this.imageWidth + 20 + 10 : 20), this.y + 36);
  this.layer.restore();
};

Mish.Event.prototype.mousemove = function(mouseX, mouseY){
  if (this.draw === true) {
    //Verify if the mouse is over the event point
    if(mouseX >= this.x - 10 && mouseX <= this.x + 10
        && mouseY >= this.y - 10 && mouseY <= this.y + 10){
      //THE CURSOR IS OVER THE EVENT POINT
      if(this.mouseOver === false){
        this.mouseOver = true;
        jQuery("#work-area-handler-sq").css({cursor: "pointer"});
        //  this.descTween = this.renderer.tween(this.descAlpha).to({alpha: 1}, 1.2);
      }
    }else{
      //THE CURSOR IS OUT THE EVENT POINT
      if(this.mouseOver === true){
        this.mouseOver = false;
        jQuery("#work-area-handler-sq").css({cursor: "e-resize"});
        //  this.descTween.end().stop();
        //  this.descTween = this.renderer.tween(this.descAlpha).to({alpha: 0}, 0.5);
      }
    }
  }
};

Mish.Event.prototype.mousedown = function(mouseX, mouseY){
  if(this.mouseOver){
    createEventDetail(this);
  }
};

Mish.Event.prototype.updateDetailElement = function(){
  this.detailElement.find(".mish_detail_title span").text(this.storeableData.title);
  if(this.imageElement){
    this.detailElement.find("div.mish_detail_description p.mish_detail_description_img img").attr("src", this.imageElement.src);
  }
  this.detailElement.find("div.mish_detail_description p.mish_detail_description_txt div.mish_detail_date").text("" + this.storeableData.date);
  this.detailElement.find("div.mish_detail_description p.mish_detail_description_txt div.mish_detail_description_text").text(this.storeableData.description);
};
