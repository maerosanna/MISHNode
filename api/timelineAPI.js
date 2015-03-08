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