//==============Global variables=================================

//Input form variables
var locat="";         //Form Event Location
var date;             //Form Event Date
var category;         //Form Event Category
//variables from Ajax
var eventLat=[];      //Event Lattidude Array
var eventLng=[];      //Event Longitude Array
var dateSelector=[]   //Event Date Array
var eventVenue=[];    //Event Venue Array
var eventName=[];     //Event Name Array
var cityName=[];      //Event City Array
//Map Variables

//var coords=[];
var map;              //Map
var latLng;           //Map API variable
var marker;           //Map API marker
var myLat;            //User Latitude
var myLng;            //User Longitude
var pickedEvent=[];   //Array of Event Buttons
var pickedLat;        //Chosen Event Latitude
var pickedLng;        //Chosen Event Longitude


$(document).ready(function() {
  $("#event-date").material_select();
  $("#event-category").material_select();
});

//================== Lodash Error Handling =========================

function parseLodash(str){
  return _.attempt(JSON.parse, str);
}

// ====================Validation Modal============================

var modal = document.getElementById('myModal');
// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];
// When the user clicks on <span> (x), close the modal
span.onclick = function() {
   modal.style.display = "none";
}

//================== on-click AJAX Call ============================

//Validation
function validateForm() {

  //wait x seconds until the data from Ajax loads and then show the map
  setTimeout(initMap, 10000);
  // prevent event default behavior
  event.preventDefault();

  //Show modal if no location information is entered
  var x = document.forms["myForm"]["fname"].value;
  if (x == "") {
      modal.style.display = "block";
      return false;
    }  
  else {

    //Search form Inputs  
    locat=x; 
    date = $("#event-date").val();
    category = $("#event-category").val();
    
    //Empty table before populating with new event information
    $("#event-table").empty();
    //Add table head back to table
    var thead = $("<tr><th>Number</th><th>Date & Time</th><th>Name of Event</th><th>Venue</th><th>City Name</th></tr>");
    $("#event-table").append(thead);

    //================  queryURL using $ajax ======================
    
    var queryURL = "https://cors-anywhere.herokuapp.com/api.eventful.com/json/events/search?app_key=54CPdHQQ4wTp4fM7&location=" + locat+ "&date="+ date + "&category" + category + "&limit=10";
    $.ajax({
      url: queryURL,
      method: "GET"
    }).done(function(response) {
      for (var i=0; i<10; i++){

        var event = parseLodash(response);
        if (_.isError(event)) {
          console.log('Error parsing JSON:', event);
        }
        //Find Longitude and Latitude of the event
        eventLat[i] = parseLodash(response).events.event[i].latitude;
        if (_.isError(eventLat[i])) {
          console.log('Error parsing JSON:', eventLat[i]);
        }
        eventLat.push(eventLat[i]);
        eventLng[i] = parseLodash(response).events.event[i].longitude;
        if (_.isError(eventLng[i])) {
          console.log('Error parsing JSON:', eventLng[i]);
        }
        eventLng.push(eventLng[i]);

        //================ Table Population ===============================
        
        //Print date
        dateSelector[i] = parseLodash(response).events.event[i].start_time;
        if (_.isError(dateSelector[i])) {
          console.log('Error parsing JSON:', dateSelector[i]);
        }
        //Print URL of the event -CHANGE TO LINK?
        eventVenue[i]= parseLodash(response).events.event[i].venue_name;
        if (_.isError(eventVenue[i])) {
          console.log('Error parsing JSON:', eventVenue[i]);
        }
        //Print event name
        eventName[i]= parseLodash(response).events.event[i].title;
        if (_.isError(eventName[i])) {
          console.log('Error parsing JSON:', eventName[i]);
        }
        //Print City name
        cityName[i] = JSON.parse(response).events.event[i].city_name;
        if (_.isError(cityName[i])) {
          console.log('Error parsing JSON:', cityName[i]);
        }

        var row = $("<tr class='event-row'>")
          .append($("<td>" + [i+1] + "</td>"))
          .append ($("<td>" + dateSelector[i] + "</td>"))
          .append($("<td>" + eventName[i] + "</td>"))
          .append($("<td>" + eventVenue[i] + "</td>"))
          .append($("<td>" + cityName[i] + "</td>"))

        //Create user buttons
        pickedEvent[i]=$("<button>").addClass("myEvent btn-large waves-effect waves-light teal lighten-1");
        pickedEvent[i].attr("id", "event" + [i]);
        pickedEvent[i].attr("data-LatValue", eventLat[i]);
        pickedEvent[i].attr("data-LngValue", eventLng[i]);
        pickedEvent[i].text("View my Lyft!");
        row.append($("<td>").append(pickedEvent[i]));
        $("#event-table").append(row);
      }; 
      clickMyEvent();
    });
  }
}

//====================Get a Lyft click event==========================


function clickMyEvent(){
  $(".myEvent").on("click", function(){
    $(this).replaceWith("<button id='lyft-web-button-parent'>");
    console.log("Id added");
    pickedLat = ($(this).attr("data-LatValue"));
    pickedLng = ($(this).attr("data-LngValue"));
    console.log("My event latitude: " + pickedLat);
    console.log("My event longitude: " + pickedLng);
    displayLyft();
    $("#lyft-web-button-parent").removeAttr("id");
    console.log("Id removed");
  });
};


//================== Display events on GoogleMap =============================

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 10,
    //Map centered on the location of the Event #1
    center: new google.maps.LatLng(eventLat[0], eventLng[0]),
  });

  for (var i=0; i<10; i++){
  latLng = new google.maps.LatLng(eventLat[i], eventLng[i]);
  marker = new google.maps.Marker({
      position: latLng,
      map: map
  });
};

//================== Display current location on GoogleMap ====================
  
  var infoWindow = new google.maps.InfoWindow;
  // HTML5 geolocation.
  if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(function(position) {
    var pos = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };
    myLat = position.coords.latitude;
    myLng = position.coords.longitude;
    $("#myLat").html("My location latitude: " + myLat);
    $("#myLng").html("My location longitude: " + myLng);
    console.log("My location latitude: " + myLat);
    console.log("My location longitude: " + myLng);
    //======this shows My location on the map
    infoWindow.setPosition(pos);
    infoWindow.setContent('Location found.');
    infoWindow.open(map);
    map.setCenter(pos);
  }, function() {
    handleLocationError(true, infoWindow, map.getCenter());
  });
  } else {
  // when Browser doesn't support Geolocation
  handleLocationError(false, infoWindow, map.getCenter());
  };  
};
//Checking if the information from the maps is available after x seconds
/* 
function getMapCoor() {
  console.log("My event lattitude = " + pickedLat);
  console.log("My event longitude = " + pickedLng);
  console.log("My latitude = " + myLat);
  console.log("My longitude = " + myLng);
  };
setTimeout(getMapCoor, 20000);
*/

//===================  Lyft API and AJAX request ========================

function displayLyft(){
  var OPTIONS = {
    scriptSrc: 'assets/lyft/dist/lyftWebButton.min.js',
    namespace: '',
    clientId: 'ttOsHDUkxRyS',
    clientToken: 'mTjSJFlEwRRmoMVo/loVl70RVsu/m2fkSlb6aeFp94q9ovNq9FRkTttsluEbv6Fv35Q2pSH41W/MjK8GG8iutze2x5MMB8+YPHXHr9Yief/gzJQN8kdXcHA=',
    location: {
      pickup: {
        latitude: myLat,
        longitude: myLng,
      }, 
      destination: {
        latitude: pickedLat,
        longitude: pickedLng,
      },
    },
    parentElement: document.getElementById('lyft-web-button-parent'),
    queryParams: {
      credits: ''
    },
    theme: 'multicolor medium',
  };
  (function(t) {
    var n = this.window,
    e = this.document;
    n.lyftInstanceIndex = n.lyftInstanceIndex || 0;
    var a = t.parentElement,
    c = e.createElement("script");
    c.async = !0, c.onload = function() {
    n.lyftInstanceIndex++;
    var e = t.namespace ? "lyftWebButton" + t.namespace + n.lyftInstanceIndex : "lyftWebButton" + n.lyftInstanceIndex;
    n[e] = n.lyftWebButton, t.objectName = e, n[e].initialize(t)
  }, c.src = t.scriptSrc, a.insertBefore(c, a.childNodes[0])
  }).call(this, OPTIONS);
};










