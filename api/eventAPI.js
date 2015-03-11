var EventModel = require('../models/EventModel').EventModel;

exports.findEvent = function(req, res){

};

exports.findEventImage = function(req, res){
  var eventData = req.query;
  EventModel.findEventImage(eventData.eventId, res, function(err, eventImageObj){
    if(err){
      return res.status(400).send({code:'error.operation'});
    }

    if(!eventImageObj){
      return res.status(400).send({code:'eventDetail.error.noImage'});
    }

    var eventDetail = {
      eventIndex: eventData.eventIndex,
      eventImage: eventImageObj
    };

    return res.status(200).send(eventDetail);
  });
};

exports.saveEvent = function(req, res){
};

exports.createEvents = function(req, res){
  var eventsData = req.body;
  var eventsImages = req.files;

  if(!eventsData){
    return res.status(400).send({code:"createEvents.error.noEventsToSave"});
  }

  var eventsToStore = [];

  //1. Create the array of events to store
  for(eventString in eventsData){
    var dataArray = eventsData[eventString].split(':|@');
    var eventObj = {};
    eventObj.title = dataArray[0];
    eventObj.description = dataArray[1];
    eventObj.date = parseInt(dataArray[2]);
    eventObj.time = parseInt(dataArray[3]);
    if(eventsImages[eventString]){
      eventObj.imageURL = eventsImages[eventString].path;
      eventObj.imageName = eventsImages[eventString].originalname;
    }
    eventObj.url = dataArray[4];

    eventsToStore.push(eventObj);
  }

  if(eventsToStore.length == 0){
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