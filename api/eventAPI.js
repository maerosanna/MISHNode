var EventModel = require('../models/EventModel').EventModel;

exports.findEvent = function(req, res){
};

exports.saveEvent = function(req, res){
};

exports.createEvents = function(req, res){
  // console.log("........................");
  // console.log(req);

  // return res.status(400).send({code:"createEvents.error.events.creation"});

  // var eventsToStore = req.body.events;

  var eventsToStore = [
    {
      "title": "cocoliso",
      "description": "pruebas",
      "date": "03-10-2014",
      "imageURL": req.files.eventImage.path,
      "imageName": req.files.eventImage.originalname
    },
    {
      "title": "simona",
      "description": "la cacalisa",
      "date": "10-02-2017",
      "imageURL": req.files.eventImage.path,
      "imageName": req.files.eventImage.originalname
    }
  ];

  if(!eventsToStore || eventsToStore.length == 0){
    return res.status(400).send({code:"createEvents.error.noEventsToSave"});
  }

  // var testEvent = new EventModel(eventsToStore[0]);
  // testEvent.save(function (err, savedEvent){
  //   if(err){
  //     console.log("err", err);
  //     return res.status(400).send({code:"createEvents.error.events.creation"});
  //   }

  //   console.log("savedEvent", savedEvent);
  //   return res.status(200).send([savedEvent]);
  // });

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