let compassCircles;
let myPoint;
let compass;
let isIOS;

function init() {
  startBtn = document.querySelector(".start-btn");
  myPoint = document.querySelector(".my-point");
  loginBtn = document.querySelector(".login-btn");
  isIOS = (
    navigator.userAgent.match(/(iPod|iPhone|iPad)/) &&
    navigator.userAgent.match(/AppleWebKit/)
  );
  //loginBtn.addEventListener("click", openAuthWindow);
  // check if Geolocation available 
  if (window.navigator.geolocation) {
    startBtn.addEventListener("click", buildCardList);          
  }
  else {
    alert("please enable geolocation services")
  }
}

function openAuthWindow() {
  let authWindow = document.createElement('div');
  authWindow.setAttribute("class", "auth-window");
  authWindow.setAttribute("id", "auth-win");
  authWindow.innerHTML = "";
  document.getElementById("body").appendChild(authWindow);

  let closeWindow = document.createElement('div');
  closeWindow.setAttribute("class", "button close-window");
  closeWindow.innerHTML = "X";
  closeWindow.addEventListener("click", closeAuthWindow);
  document.getElementById("auth-win").appendChild(closeWindow);

  let form = document.createElement('form');
  form.setAttribute("class", "inputForm");
  form.setAttribute("id", "inputForm");
  form.setAttribute("action", "/actionpage.php");
  form.innerHTML = "";
  document.getElementById("auth-win").appendChild(form);

  let unameLabel = document.createElement('label');
  unameLabel.setAttribute("for", "uname");
  unameLabel.innerHTML = "Username: ";
  document.getElementById("inputForm").appendChild(unameLabel);

  let unameInput = document.createElement('input');
  unameInput.setAttribute("type", "text");
  unameInput.setAttribute("id", "uname");
  unameInput.setAttribute("name", "uname");
  document.getElementById("inputForm").appendChild(unameInput);

  for (i = 0; i < 2; i++){
    let lineBreak = document.createElement('br');
    document.getElementById("inputForm").appendChild(lineBreak);
  }

  let passLabel = document.createElement('label');
  passLabel.setAttribute("for", "uname");
  passLabel.innerHTML = "Password:             ";
  document.getElementById("inputForm").appendChild(passLabel);

  let upassInput = document.createElement('input');
  upassInput.setAttribute("type", "text");
  upassInput.setAttribute("id", "upass");
  upassInput.setAttribute("name", "upass");
  document.getElementById("inputForm").appendChild(upassInput);


/*

  <form action="/action_page.php">
  <label for="fname">First name:</label>
  <input type="text" id="fname" name="fname">
    <br><br>
  <label for="lname">Last name:</label>
  <input type="text" id="lname" name="lname"><br><br>
  <input type="submit" value="Submit">
</form>*/
}

function closeAuthWindow(){
  document.getElementById("auth-win").remove();
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
    gsradius: "1600",
    gslimit: "500",
    format: "json"
  };

  var nearbyWikis = [];

  url = url + "?origin=*";
  Object.keys(params).forEach(function(key){url += "&" + key + "=" + params[key];});

  fetch(url)
    .then(function(response){return response.json();})
    .then(function(response) {
      let pages = response.query.geosearch;
      console.log(pages[0]);
      for (let place in pages) {
        //console.log(pages[place].title);
        //console.log(pages[place]);
        //console.log(pages[place].lat);
        //console.log(pages[place].lon);
        nearbyWikis.push(pages[place]);
      }
      for (i = 0; i < nearbyWikis.length; i++){
        let distanceFromUser = coordDistance(nearbyWikis[i].lat, nearbyWikis[i].lon, userPos.coords.latitude, userPos.coords.longitude, "M");
        let angleFromUser = calcDegreeToPoint(userPos.coords.latitude, userPos.coords.longitude, nearbyWikis[i].lat, nearbyWikis[i].lon,)
        let element = document.createElement('div');
        element.setAttribute("class", "wikicard")
        element.innerHTML = 
          "<a class='cardText' href=" + makeWikiLink(nearbyWikis[i].title) + ">" + nearbyWikis[i].title + "</a>" +
          "<a class='compass' href='https://www.google.com/maps/search/?api=1&query=" + nearbyWikis[i].lat.toString() + "," + nearbyWikis[i].lon.toString() + "'>" +
            "<div class='distance'>" + distanceFromUser.toFixed(2).toString() + " mi</div>" +
            "<div class='arrow'></div>" +
            (distanceFromUser > 0.2 ? "<div class='compass-circle' dist=" + distanceFromUser.toString() + " ang=" + angleFromUser.toString() + "></div>" : "") +
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
  compass = e.webkitCompassHeading || Math.abs(e.alpha - 360);
  console.log("compass"); 
  if (compassCircles != undefined){
    for (i = 0; i < compassCircles.length; i++){
      angleOffset = compassCircles[i].getAttribute("ang");
      compassCircles[i].style.transform = `translate(-50%, -50%) rotate(${-compass + parseFloat(angleOffset)}deg)`;
    }
  }
}

function calcDegreeToPoint(lat1, lon1, lat2, lon2) {
  const phiK = (lat2 * Math.PI) / 180.0;
  const lambdaK = (lon2 * Math.PI) / 180.0;
  const phi = (lat1 * Math.PI) / 180.0;
  const lambda = (lon1 * Math.PI) / 180.0;
  const psi =
    (180.0 / Math.PI) *
    Math.atan2(
      Math.sin(lambdaK - lambda),
      Math.cos(phi) * Math.tan(phiK) -
        Math.sin(phi) * Math.cos(lambdaK - lambda)
    );
  return Math.round(psi);
}

window.onload = init;