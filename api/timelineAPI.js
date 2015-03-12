var TimelineModel = require('../models/TimelineModel').TimelineModel;

exports.findTimeline = function(req, res){
};

exports.saveTimeline = function(req, res){
  var timelineData = req.body;
  var timelineObj = new TimelineModel(timelineData);

  timelineObj.save(function (err, savedTimeline) {
    if(err){
      console.log('No se pudo guardar el timeline', err);
      return res.status(400).send(err);
    }

    return res.status(200).send(savedTimeline);
  });
};

exports.updateTimeline = function(req, res){
  //1. Recorrer los eventos en la línea de tiempo para determinar cuáles son nuevos,
  //   cuáles han sido modificados y cuáles permenecieron intactos.
  var timelineObj = req.body;

  if(!timelineObj || !timelineObj.eventsToAdd || timelineObj.eventsToAdd.length == 0){
    return res.status(400).send({code:'error.operation'});
  }

  TimelineModel.addEventsToTimeline(timelineObj._id, timelineObj.eventsToAdd, function(err, timelineUpdated){
    if(err){
      console.log('No se pudo actualizar el timeline', err);
      return res.status(400).send(err);
    }

    return res.status(200).send(timelineUpdated);
  });
};