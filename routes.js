/**
 File for managing the application routes
 */

//Get the API files
var userAPI = require('./api/userAPI');
var timelineAPI = require('./api/timelineAPI');
var eventAPI = require('./api/eventAPI');

module.exports = function (app) {
  //- - - - - - - - - - - - - - - - - - - - - - - -
  //User routes (API)
  //- - - - - - - - - - - - - - - - - - - - - - - -
  app.get('/user', userAPI.findUser);
  app.get('/userAuth', userAPI.findUserSession);
  app.get('/userDetail', userAPI.findUserDetail);
  app.get('/userLogout', userAPI.logoutUser);
  app.post('/user', userAPI.saveUser);

  //- - - - - - - - - - - - - - - - - - - - - - - -
  //Timeline routes (API)
  //- - - - - - - - - - - - - - - - - - - - - - - -
  app.get('/timeline', timelineAPI.findTimeline);
  app.post('/timeline', timelineAPI.saveTimeline);
  app.put('/timeline', timelineAPI.updateTimeline);

  //- - - - - - - - - - - - - - - - - - - - - - - -
  //Event routes (API)
  //- - - - - - - - - - - - - - - - - - - - - - - -
  app.get('/event', eventAPI.findEvent);
  app.get('/eventImage', eventAPI.findEventImage);
  app.post('/event', eventAPI.saveEvent);
  app.post('/events', eventAPI.createEvents);
  app.put('/events', eventAPI.updateEvents);
  app.delete('/events', eventAPI.deleteEvents);

};