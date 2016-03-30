function showTimelinesPanel(show){
  if(show){
    jQuery("#user_timelines_container").show();
    jQuery(".user_timelines_panel").slideDown();
  }else{
    jQuery(".user_timelines_panel").slideUp();
    jQuery("#user_timelines_container").fadeOut();
  }
}