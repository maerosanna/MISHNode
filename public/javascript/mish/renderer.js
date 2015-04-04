function createRenderer(){
  supermish.renderer = playground({
    container: "#canvas-container",
    preventKeyboardDefault: false,

    create: function() {
      
    },

    ready: function() {
      // this.mouse.element = document.getElementById("work-area-handler-sq");
    },

    step: function(delta) {
      //Call the step method in all the events
      if(supermish.timelineEvents.length > 0){
        for(var i=0; i<supermish.timelineEvents.length; i++){
          supermish.timelineEvents[i].step();
        }
      }
    },

    render: function(delta) {
      //Clear the canvas
      this.layer.clear("#FFF");
      if(supermish.timelineEvents.length > 0){
        for(var i=0; i<supermish.timelineEvents.length; i++){
          supermish.timelineEvents[i].render();
        }
      }

      //Draw a dashed line in the center of the screen for nothing...
      //    this.drawCenterLine();
    },

    mousedown: function(event) {
      //Call the "mousedown" method in all the events
      if(supermish.timelineEvents.length > 0){
        for(var i=0; i<supermish.timelineEvents.length; i++){
          supermish.timelineEvents[i].mousedown(event.x, event.y);
        }
      }
    },

    mouseup: function(event) {

    },

    mousemove: function(event) {
      //Call the "mousemove" method in all the events
      if(supermish.timelineEvents.length > 0){
        for(var i=0; i<supermish.timelineEvents.length; i++){
          supermish.timelineEvents[i].mousemove(event.x, event.y);
        }
      }
    },

    keydown: function(event) {

    },

    keyup: function(event) {

    },

    drawCenterLine: function(){
      this.layer.context.lineWidth = 1;
      this.layer.context.lineCap = 'square';
      this.layer.context.lineJoin = 'square';
      this.layer.context.strokeStyle = "#CF6E3E";
      this.layer.context.setLineDash([5, 10]);

      //Draw the dashed line to de timeline
      this.layer.context.beginPath();
      this.layer.context.moveTo(mishGA.workAreaWidth/2, mishGA.workAreaHeight - 200);
      this.layer.context.lineTo(mishGA.workAreaWidth/2, mishGA.workAreaHeight);
      this.layer.context.stroke();
      this.layer.context.closePath();
    }

  });
}