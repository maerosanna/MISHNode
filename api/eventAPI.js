var EventModel = require('../models/EventModel').EventModel;

exports.findEvent = function(req, res){
};

exports.saveEvent = function(req, res){
};

exports.createEvents = function(req, res){
  var eventsToStore = req.body.events;

  if(!eventsToStore || eventsToStore.length == 0){
    return res.status(400).send({code:"createEvents.error.noEventsToSave"});
  }

  EventModel.create(eventsToStore, function (err, /*saved events*/ savedEvents) {
    if(err || !savedEvents || (savedEvents && savedEvents.length === 0)){
      console.log('No se pudo guardar el arreglo de eventos', err);
      return res.status(400).send({code:"createEvents.error.events.creation"});
    }

    var arrayOfSavedEvents = [];
    for(var i=1; i<arguments.length; i++){
      arrayOfSavedEvents.push(arguments[i]);
    }

    return res.status(200).send(arrayOfSavedEvents);
  });
};