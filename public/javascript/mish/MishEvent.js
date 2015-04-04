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
  
  this.draw = false;
  this.mouseOver = false;
  this.descAlpha = {
    alpha: 0
  };
  this.descTween = null;
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
  if(this.containerGroup){
    this.containerGroup = findGroupOfEvent(this.storeableData.time);
    this.x = calculateXPosOfEvent(this.containerGroup, this.storeableData);
  }

  if (this.x < mishGA.workAreaWidth
      && this.x >= 0) {
    this.draw = true;
  }else{
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
    if(this.imageElement){
      this.drawImage();
    }

    this.drawDescription();

    //Move the DIV element if exists
    if(this.detailElement){
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
  //Define the properties of the event to draw
  this.layer.context.font = "20px sans-serif";
  this.layer.context.fillStyle = "#499AAF";

  //Draw the title of the event
  this.layer.context.fillText(this.storeableData.title, this.x + 20, this.y + 6);
};

Mish.Event.prototype.drawImage = function(){
  this.layer.context.drawImage(this.imageElement, this.x + 20, this.y + 16, this.imageWidth, this.imageWidth);
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
