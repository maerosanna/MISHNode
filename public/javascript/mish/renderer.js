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

      //Call the render method in all the events
      // this.layer.fillStyle("#fff").font("64px Arial").fillText("Hello World!", 200, 200);
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

    }

  });
}