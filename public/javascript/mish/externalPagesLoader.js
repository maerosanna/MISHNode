/**
 * Function that loads all the external pages.
 *
 * @returns {undefined}
 */
function loadExternalPages() {
  //Load newUserForm.html
  jQuery("#newUserDialog").load("pages/newUserForm.html", function () {
    //Create and configure the 'Create User' dialog
    createBasicDialog('#newUserDialog', 'dialog.createUser.title');
    //Configure fields

    //Assign button listeners
    jQuery("#newUserCancel").click(function () {
      closeDialog("#newUserDialog");
    });
    jQuery("#buttonCreateUser").click(createUserBtnAction);
    
    //Hide the info section
    jQuery("#infoCreateUser").hide();
    
    //Hide the error section
    jQuery("#errorCreateUser").hide();
  });

  //Load logInForm.html
  jQuery("#logInDialog").load("pages/logInForm.html", function () {
    //Create and configure the 'Log In' dialog
    createBasicDialog('#logInDialog', 'dialog.logIn.title');
    //Assign button listeners
    jQuery("#loginCancel").click(function () {
      closeDialog("#logInDialog");
    });
    jQuery("#buttonLogIn").click(logInBtnAction);
    //Hide the error section
    jQuery("#errorLogin").hide();
  });

  //Load newEventForm.html
  jQuery("#newEventDialog").load("pages/newEventForm.html", function () {
    //Create and configure the 'Create Event' dialog
    createBasicDialog('#newEventDialog', 'dialog.createEvent.title');
    //Assign button listeners
    jQuery("#newEventCancel").click(function () {
      //Clear the event to update
      if(supermish.get("eventToUpdate")){
        supermish.set("eventToUpdate", -1);
      }
      jQuery("#buttonCreateEvent").hide();
      jQuery("#buttonEditEvent").hide();
      closeDialog("#newEventDialog");
    });
    jQuery("#buttonCreateEvent").hide();
    jQuery("#buttonCreateEvent").click(createMISHEventBtnAction);
    jQuery("#buttonEditEvent").hide();
    jQuery("#buttonEditEvent").click(updateMISHEventBtnAction);
    //Hide the error section
    jQuery("#errorNewEvent").hide();
  });

  //Load deleteEventForm.html
  jQuery("#deleteEventDialog").load("pages/deleteEventForm.html", function () {
    //Create and configure the 'Create Event' dialog
    createBasicDialog('#deleteEventDialog', 'dialog.deleteEvent.title');
    //Assign button listeners
    jQuery("#deleteEventCancel").click(function () {
      //Clear the evento to delete from the MISH object
      supermish.set("eventToDelete", -1);

      //Close the popup
      closeDialog("#deleteEventDialog");
    });

    jQuery("#buttonDeleteEvent").click(deleteMISHEventBtnAction);

  });

  //Load newTimelineForm.html
  jQuery("#newTimelineDialog").load("pages/newTimelineForm.html", function () {
    //Create and configure the 'Create timeline' dialog
    createBasicDialog('#newTimelineDialog', 'dialog.createTimeline.title');
    
    //Assign button listeners
    jQuery("#saveTimelineCancel").click(function () {
      closeDialog("#newTimelineDialog");
    });
    
    jQuery("#buttonCreateTimeline").click(createTimelineBtnAction);
    
    //Hide the error section
    jQuery("#errorSaveTimeline").hide();
  });

  //Load canvasContextMenu.html
  jQuery("#canvasContextMenu").load("pages/canvasContextMenu.html", function () {
    jQuery("#menu").menu();
    
    //Assign Create Event function
    jQuery("#contextCreateEvent").click(function () {
      createDateField("#eventDate");
      jQuery("#buttonEditEvent").hide();
      jQuery("#buttonCreateEvent").show();
      jQuery('#newEventDialog').dialog('open');
      closeMenu();
    });

    //Assign Save Timeline function
    jQuery("#contextSaveTimeline").click(function () {
      saveTimelineBtnAction();
      closeMenu();
    });
  });

  //Load alert.html
  /*jQuery("#alertsDialog").load("pages/alert.html", function(){
    console.log("L O A D E D");
  });
  */
    jQuery("#footerNewEvent").click(function () {
        createDateField("#eventDate");
        jQuery("#buttonEditEvent").hide();
        jQuery("#buttonCreateEvent").show();
        jQuery('#newEventDialog').dialog('open');
        closeMenu();
    });
}

function createDateField(targetId) {
  return jQuery(targetId).datepicker({
    dateFormat: "dd-mm-yy",
    changeMonth: true,
    changeYear: true,
    minDate: new Date(1900, 0, 1),
    maxDate: new Date(),
    showWeek: true,
    yearRange: "1900:+0", // dates in thic component can't be less than 1900
    dayNamesMin: [ "Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"],
    weekHeader: "Sem",
    monthNamesShort: [ "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic" ],
    nextText: "Sig",
    prevText: "Ant"
  });
  $.datepicker.regional[ "es" ];
}