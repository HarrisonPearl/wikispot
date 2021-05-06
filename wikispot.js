let compassCircles;
let myPoint;
let compass;
let isIOS;

function init() {
  startBtn = document.querySelector(".start-btn");
  myPoint = document.querySelector(".my-point");
  isIOS = (
    navigator.userAgent.match(/(iPod|iPhone|iPad)/) &&
    navigator.userAgent.match(/AppleWebKit/)
  );
  // check if Geolocation available 
  if (window.navigator.geolocation) {
    startBtn.addEventListener("click", buildCardList);          
  }
  else {
    alert("please enable geolocation services")
  }
}

function buildCardList(){
  window.navigator.geolocation
    .getCurrentPosition(generateCards, console.log);

  if (isIOS) {
    DeviceOrientationEvent.requestPermission()
      .then((response) => {
        if (response === "granted") {
          window.addEventListener("deviceorientation", handler, true);
        } else {
          alert("has to be allowed!");
        }
      })
      .catch((response) => alert(response));
  } else {
    window.addEventListener("deviceorientationabsolute", handler, true);
  }

  startBtn.remove();
}

function generateCards(userPos){
  var url = "https://en.wikipedia.org/w/api.php"; 

  var params = {
    action: "query",
    list: "geosearch",
    gscoord: userPos.coords.latitude.toString() + "|" + userPos.coords.longitude.toString(),
    gsradius: "800",
    gslimit: "100",
    format: "json"
  };

  var nearbyWikis = [];

  url = url + "?origin=*";
  Object.keys(params).forEach(function(key){url += "&" + key + "=" + params[key];});

  fetch(url)
    .then(function(response){return response.json();})
    .then(function(response) {
      var pages = response.query.geosearch;
      for (var place in pages) {
        console.log(pages[place].title);
        console.log(pages[place].lat);
        console.log(pages[place].lon);
        nearbyWikis.push(pages[place]);
      }
      for (i = 0; i < nearbyWikis.length; i++){
        console.log(nearbyWikis[i]);
        var distanceFromUser = coordDistance(nearbyWikis[i].lat, nearbyWikis[i].lon, userPos.coords.latitude, userPos.coords.longitude, "M");
        var element = document.createElement('div');
        element.setAttribute("class", "wikicard")
        element.innerHTML = 
          "<a href=" + makeWikiLink(nearbyWikis[i].title) + ">" + nearbyWikis[i].title + " " + distanceFromUser.toFixed(2).toString() + " mi" + "</a>" +
          "<div class='compass'>" +
            "<div class='arrow'></div>" +
            "<div class='compass-circle'></div>" +
            "<div class='my-point'></div>" +
          "</div>";
        document.getElementById("card-list").appendChild(element);
      }
      compassCircles = document.querySelectorAll(".compass-circle");
      console.log("num of wikis");
      console.log(nearbyWikis.length);
    })
    .catch(function(error){console.log(error);});
}

function makeWikiLink(title) {
  let link = "https://en.wikipedia.org/wiki/" + title.replaceAll(" ", "_");
  console.log(link);
  return link;
}

function coordDistance(lat1, lon1, lat2, lon2, unit) {
	if ((lat1 == lat2) && (lon1 == lon2)) {
		return 0;
	}
	else {
		var radlat1 = Math.PI * lat1/180;
		var radlat2 = Math.PI * lat2/180;
		var theta = lon1-lon2;
		var radtheta = Math.PI * theta/180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if (dist > 1) {
			dist = 1;
		}
		dist = Math.acos(dist);
		dist = dist * 180/Math.PI;
		dist = dist * 60 * 1.1515;
		if (unit=="K") { dist = dist * 1.609344 }
		if (unit=="N") { dist = dist * 0.8684 }
		return dist;
	}
}

function handler(e) {
  compass = e.webkitCompassHeading;//;
  console.log("compass");
  console.log(e.webkitCompassHeading);
  console.log(Math.abs(e.alpha - 360));
  document.getElementById("num").innerHTML = compass.toString(); 
  if (compassCircles != undefined){
    for (i = 0; i < compassCircles.length; i++){
      compassCircles[i].style.transform = `translate(-50%, -50%) rotate(${-compass}deg)`;
    }
  }
}

window.onload = init;