let compassCircles;
let compass;
let isIOS;
let isMobile = null;
let usersWikis = [];
let usersWikisTitlesAndKeys = {};
let showUserWikis = false;
let dbRefUserSpots;
let currUser = null;
let userPosition = null;
let initialTab = true;

/////////////
// Check for signed in user, load their wikis in userWikis if a user exists
////////////


firebase.auth()
  .getRedirectResult()
  .then((result) => {
    if (result.credential) {
      /** @type {firebase.auth.OAuthCredential} */
      var credential = result.credential;

      // This gives you a Google Access Token. You can use it to access the Google API.
      var token = credential.accessToken;
      // ...
    }
    // The signed-in user info.
    var user = result.user;
    console.log(user.uid);
    
  }).catch((error) => {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
    // ...
    console.log("No User Signed In");
  });

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    currUser = user;
    console.log("got one", user);

    loginBtn = document.querySelector(".login-btn");
    if (loginBtn){
      loginBtn.remove();
    }

    let userMenu = document.createElement('div');
    userMenu.setAttribute("class", "user-menu");
    document.getElementById("body").appendChild(userMenu);

    let currUserSign = document.createElement('div');
    currUserSign.setAttribute("class", "curr-user-sign");
    currUserSign.innerHTML = "Hi, " + user.displayName.substr(0,user.displayName.indexOf(' '));
    userMenu.appendChild(currUserSign);

    let logoutButton = document.createElement('button');
    logoutButton.setAttribute("class", "button logout-btn");
    logoutButton.addEventListener("click", logoutUser);
    logoutButton.innerHTML = "Log Out";
    userMenu.appendChild(logoutButton);
    /*
    let mySpotButton = document.createElement('button');
    mySpotButton.setAttribute("class", "button my-spots-btn");
    mySpotButton.setAttribute("id", "mSpotButton");
    mySpotButton.innerHTML = "My Wikis";
    // username access:
    //user.displayName.substr(0,user.displayName.indexOf(' '))
    mySpotButton.addEventListener("click", switchCardList);
    document.getElementById("body").appendChild(mySpotButton);*/

    dbRefUserSpots = firebase.database().ref()
      .child('users')
      .child(user.uid)
      .child('wikispots')
    
    
    
    dbRefUserSpots.on('value', snap => handleSnap(snap));

  }
  else {
    console.log("no user, didnt get one");

    //<button class="button start-btn">Find Wikispots</button>
    //TODO: this should only happen if there isnt already a start btn and there isnt already cards
    if (!document.querySelector(".start-btn") && !document.querySelector(".wikicard"))
    {
      let startBtn = document.createElement('button');
      startBtn.setAttribute("class", "button start-btn");
      startBtn.addEventListener("click", buildCardList);
      startBtn.innerHTML = "Find Wikispots"
      document.getElementById("body").insertBefore(startBtn, document.querySelector(".card-list-container"));
    }
    
    let loginBtn = document.createElement('button');
    loginBtn.setAttribute("class", "button login-btn");
    loginBtn.addEventListener("click", openAuthWindow);
    loginBtn.innerHTML = "log in to start collecting wikispots"
    //document.getElementById("body").appendChild(loginBtn);
    document.getElementById("body").insertBefore(loginBtn, document.querySelector(".title-card").nextSibling);
  }
});

function handleSnap(snap) {
  console.log("made it to the snap");
  usersWikis = [];
  /*for (i = 0; i < Object.keys(snap.val()).length; i++){
    console.log(snap.val()[i]);
    usersWikis.push(snap.val()[i]);
    numUserWikis += 1;
  }*/
  for (const key in snap.val()){
    console.log(key);//this needs to be stored in order to allow for deletion later
    usersWikis.push(snap.val()[key]);
    if (!(snap.val()[key].title in usersWikisTitlesAndKeys)){
      usersWikisTitlesAndKeys[snap.val()[key].title] = key;
    }
  }
  console.log(usersWikis);
  console.log("titles", usersWikisTitlesAndKeys);

  //<button class="button start-btn">Find Wikispots</button>
  if (!document.querySelector(".start-btn") && !document.querySelector(".wikicard"))
  {
    let startBtn = document.createElement('button');
    startBtn.setAttribute("class", "button start-btn");
    startBtn.addEventListener("click", buildCardList);
    startBtn.innerHTML = "Find Wikispots"
    document.getElementById("body").insertBefore(startBtn, document.querySelector(".card-list-container"));
  }

  //buildCardList();
}

///////
// init
///////


function init() {
  // return events bring user to last scroll position
  if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
    || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))){ 
    isMobile = true;
  }
  if (isMobile){
    window.addEventListener( "pageshow", function ( event ) {
      var historyTraversal = event.persisted || (
        typeof window.performance.getEntriesByType("navigation")[0] != "undefined" && 
        window.performance.getEntriesByType("navigation")[0].type === "back_forward" 
      );
      if (historyTraversal) {
        window.scrollTo(0, 1);
      }
    });
  }

  isIOS = (
    navigator.userAgent.match(/(iPod|iPhone|iPad)/) &&
    navigator.userAgent.match(/AppleWebKit/)
  ); 
}

function refreshCardList() {
  let refBtn = document.querySelector(".refresh-btn");
  refBtn.classList.add("refresh-btn-rotate");
  window.setTimeout(function () {
    buildCardList()
    refBtn.classList.remove("refresh-btn-rotate");
  }, 1000);
  
}
// card list control

function switchCardList(){
  showUserWikis = !showUserWikis;
  let cListCountainer = document.querySelector(".card-list-container");
  let uWikisButton = document.getElementById("uwButton");
  let nWikisButton = document.getElementById("nwButton");
  let logoutButton = document.querySelector(".logout-btn");
  logoutButton.disabled = true;
  uWikisButton.disabled = true;
  nWikisButton.disabled = true;
  if (showUserWikis) {
    
    document.getElementById("card-list").classList.remove("collapsed");
    document.getElementById("user-card-list").classList.remove("collapsed");
    cListCountainer.classList.add("shift-left");

    nWikisButton.classList.add("tab-active");
    uWikisButton.classList.remove("tab-active");

    window.setTimeout(function () {
      document.getElementById("card-list").classList.add("collapsed");
      nWikisButton.disabled = false;
      logoutButton.disabled = false;
    }, 1000);
    
  }
  else {
    document.getElementById("card-list").classList.remove("collapsed");
    document.getElementById("user-card-list").classList.remove("collapsed");
    cListCountainer.classList.remove("shift-left");
    
    uWikisButton.classList.add("tab-active");
    nWikisButton.classList.remove("tab-active");

    window.setTimeout(function () {
      document.getElementById("user-card-list").classList.add("collapsed");
      uWikisButton.disabled = false;
      logoutButton.disabled = false;
    }, 1000);
  }

  
  
  //my-spots-btn
  //buildCardList()n 
}

// Auth window
function openAuthWindow() {
  let authWindow = document.createElement('div');
  authWindow.setAttribute("class", "auth-window");
  authWindow.setAttribute("id", "auth-win");
  document.getElementById("body").appendChild(authWindow);

  let closeWindow = document.createElement('div');
  closeWindow.setAttribute("class", "button close-window");
  closeWindow.addEventListener("click", closeAuthWindow);
  document.getElementById("auth-win").appendChild(closeWindow);

  /*
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
  */
  
  let googleLogin = document.createElement('button');
  googleLogin.setAttribute("class", "google-auth");
  googleLogin.setAttribute("id", "gauth");
  googleLogin.setAttribute("onclick", "signInWithRedirect()")
  document.getElementById("auth-win").appendChild(googleLogin);


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

function logoutUser(){
  if (currUser){
    currUserSign = document.querySelector(".curr-user-sign");
    currUserSign.remove();
    if(showUserWikis){
      switchCardList();
    }
    mySpotsBtn = document.getElementById("mSpotButton");
    if (mySpotsBtn){
      mySpotsBtn.remove();
    }

    saveBtns = document.querySelectorAll(".save-btn").forEach(sb => sb.remove());
    logoutButton = document.querySelector(".logout-btn");
    logoutButton.remove();

    usersWikis = [];

    firebase.auth().signOut().then(() => {
      console.log("user signed out")
    }).catch((error) => {
      console.log(error)
    });
  }
  
}

function signInWithRedirect(){
  provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithRedirect(provider);
}

function closeAuthWindow(){
  document.getElementById("auth-win").remove();
}

// card list building
function buildCardList(){
  // get orientation permission
  if (isIOS) {
    DeviceOrientationEvent.requestPermission()
      .then((response) => {
        if (response === "granted") {
          window.addEventListener("deviceorientation", handler, true);
        } else {
          alert("Orientation has to be allowed for the app to function");
        }
      })
      .catch((response) => alert(response));
  } 
  else {
    window.addEventListener("deviceorientationabsolute", handler, true);
  }

  // ask for user position permission, if granted, generate cards
  if (window.navigator.geolocation) {
    window.navigator.geolocation
      .getCurrentPosition(generateCards, console.log);

    
    /*if ((currUser && usersWikis.length != 0) && document.getElementById("mSpotButton") == null){
      generateTabButtons();
    }*/
  }
  else {
    alert("Please enable geolocation services")
  }
}

function generateTabButtons(){
  let mySpotButton = document.createElement('div');
  if (initialTab){
    mySpotButton.setAttribute("class", "tab-btn-container tab-btn-container-hidden");
    initialTab = false;
    console.log("initial tab set false");
  }
  else {
    mySpotButton.setAttribute("class", "tab-btn-container");
    //console.log("initial tab was false");
  }
  
  mySpotButton.setAttribute("id", "mSpotButton");
  //ocument.getElementById("body").appendChild(mySpotButton);
  document.getElementById("body").insertBefore(mySpotButton, document.querySelector(".card-list-container"));

  let nWikisButton = document.createElement('button');
  if (showUserWikis){
    nWikisButton.setAttribute("class", "button tab-btn tab-active");
  }
  else{
    nWikisButton.setAttribute("class", "button tab-btn");
  }
  nWikisButton.setAttribute("id", "nwButton");
  nWikisButton.innerHTML = "Nearby Wikis";
  nWikisButton.addEventListener("click", switchCardList);
  document.getElementById("mSpotButton").appendChild(nWikisButton);

  let uWikisButton = document.createElement('button');
  if (!showUserWikis){
    uWikisButton.setAttribute("class", "button tab-btn tab-active");
  }
  else{
    uWikisButton.setAttribute("class", "button tab-btn");
  }
  uWikisButton.setAttribute("id", "uwButton");
  uWikisButton.innerHTML = "My Wikis";
  uWikisButton.addEventListener("click", switchCardList);
  document.getElementById("mSpotButton").appendChild(uWikisButton);

  if (showUserWikis) {
    uWikisButton.disabled = true;
    nWikisButton.disabled = false;
  }
  else {
    uWikisButton.disabled = false;
    nWikisButton.disabled = true;
  }
  window.setTimeout(function () {
    mySpotButton.classList.remove("tab-btn-container-hidden");
  }, 500);
  
}

function generateCards(userPos){
  userPosition = userPos;
  var url = "https://en.wikipedia.org/w/api.php"; 

  // set gslimits
  var params = {
    action: "query",
    list: "geosearch",
    gscoord: userPosition.coords.latitude.toString() + "|" + userPosition.coords.longitude.toString(),
    gsradius: "10000",
    gslimit: "300",
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
        nearbyWikis.push(pages[place]);
      }

      usersWikis.sort(
        function(a,b) {
          let aDistanceFromUser = coordDistance(a.lat, a.lon, userPosition.coords.latitude, userPosition.coords.longitude, "M");
          let bDistanceFromUser = coordDistance(b.lat, b.lon, userPosition.coords.latitude, userPosition.coords.longitude, "M");
          
          let dir = 'asc';
          if (dir === 'asc') {
            return aDistanceFromUser - bDistanceFromUser;
          };
        return bDistanceFromUser - aDistanceFromUser;
        }
      );

      if (document.querySelector(".wikicard")){
        clearCardList();
      }

      for (i = 0; i < usersWikis.length; i++){
        createCard(usersWikis[i].title, usersWikis[i].lat, usersWikis[i].lon, "user");
      }

      /*window.setTimeout(function () {
        document.getElementById("card-list").classList.remove("card-list-left");
      }, 1000);*/

      for (i = 0; i < nearbyWikis.length; i++){
        createCard(nearbyWikis[i].title, nearbyWikis[i].lat, nearbyWikis[i].lon, "nearby");
      }

      if ((currUser && usersWikis.length != 0) && document.getElementById("mSpotButton") == null){
        generateTabButtons();
      }

      //<div class="bottom-text">bottom text</div>
      let bottomTextElement = document.createElement('div');
      bottomTextElement.setAttribute("class", "bottom-text");
      bottomTextElement.innerHTML = "move to find more wikis :)";
      document.getElementById("card-list").appendChild(bottomTextElement);

      //<div class="refresh-btn"></div>
      if (!document.querySelector(".refresh-btn")){
        let refBtn = document.createElement('div');
        refBtn.setAttribute("class", "refresh-btn");
        refBtn.addEventListener("click", refreshCardList);
        document.getElementById("body").appendChild(refBtn);
      }

      let startBtn = document.querySelector(".start-btn");
      if (startBtn) {
        startBtn.remove();
      }

      /*window.setTimeout(function () {
        document.getElementById("card-list").classList.remove("card-list-left");
      }, 1000);*/



      



      //cards are generated from nearby wikis or user wikis depending
      /*if (showUserWikis){
        let bt = document.querySelector(".bottom-text");
        bt.remove();
        if (document.querySelector(".wikicard")){
          clearCardList();
        }*/
        /*usersWikis.sort(
          function(a,b) {
            let aDistanceFromUser = coordDistance(a.lat, a.lon, userPosition.coords.latitude, userPosition.coords.longitude, "M");
            let bDistanceFromUser = coordDistance(b.lat, b.lon, userPosition.coords.latitude, userPosition.coords.longitude, "M");
            
            let dir = 'asc';
            if (dir === 'asc') {
              return aDistanceFromUser - bDistanceFromUser;
            };
          return bDistanceFromUser - aDistanceFromUser;
          }
        );
        for (i = 0; i < usersWikis.length; i++){
          createCard(usersWikis[i].title, usersWikis[i].lat, usersWikis[i].lon);
        }

        window.setTimeout(function () {
          document.getElementById("card-list").classList.remove("card-list-left");
        }, 1000);
        
      }
      else {*/
        /*if (document.querySelector(".wikicard")){
          clearCardList();
        }*/
        /*for (i = 0; i < nearbyWikis.length; i++){
          createCard(nearbyWikis[i].title, nearbyWikis[i].lat, nearbyWikis[i].lon);
        }
        //<div class="bottom-text">bottom text</div>
        let bottomTextElement = document.createElement('div');
        bottomTextElement.setAttribute("class", "bottom-text");
        bottomTextElement.innerHTML = "move to find more wikis :)"
        document.getElementById("card-list").appendChild(bottomTextElement);

        window.setTimeout(function () {
          document.getElementById("card-list").classList.remove("card-list-left");
        }, 1000);
      }   */   

      compassCircles = document.querySelectorAll(".compass-circle");
      console.log("num of wikis");
      console.log(nearbyWikis.length);
    })
    .catch(function(error){console.log(error);});
}


function createCard(title, lat, lon, listType){
  let distanceFromUser = coordDistance(lat, lon, userPosition.coords.latitude, userPosition.coords.longitude, "M");
  let angleFromUser = calcDegreeToPoint(userPosition.coords.latitude, userPosition.coords.longitude, lat, lon,)
  let element = document.createElement('div');
  element.setAttribute("class", "wikicard")
  element.innerHTML = 
    "<a class='cardText' href=" + makeWikiLink(title) + ">" + title + "</a>" +
    "<a class='compass' href='https://www.google.com/maps/search/?api=1&query=" + lat.toString() + "," + lon.toString() + "'>" +
      "<div class='distance'>" + distanceFromUser.toFixed(2).toString() + " mi</div>" +
      "<div class='arrow'></div>" +
      (distanceFromUser > 0.2 ?
        "<div class='compass-circle' dist=" + distanceFromUser.toString() + " ang=" + angleFromUser.toString() + "></div>" : "") +
      "<div class='my-point'></div>" +
    "</a>" +
    (((distanceFromUser < 0.2 && !(title in usersWikisTitlesAndKeys)) && currUser)?
      `<div class="button save-btn" onclick="saveWiki(this, '${title.replaceAll("'", "specialApos").replaceAll('"', "specialQuote")}', ${lat}, ${lon})">save</div>` : "") +
    (listType == "user" ?
      `<div class='delete-container-y'><div class ='button delete-btn' onclick='confirmDelete(this)'>remove</div></div>` : "");

  if (listType == "user") {
    document.getElementById("user-card-list").appendChild(element);
  }
  else {
    document.getElementById("card-list").appendChild(element);
  }
}

function saveWiki(element, atitle, alat, alon){
  /*if (usersWikis.length == 0){
    console.log(initialTab);
    generateTabButtons();
  }*/

  console.log("save");
  let newSpot = {};
  newSpot['title'] = atitle.replaceAll("specialApos", "'").replaceAll("specialQuote", '"');
  newSpot['lat'] = alat;
  newSpot['lon'] = alon;
  dbRefUserSpots.push(newSpot);
  element.remove();

  buildCardList();
}

function confirmDelete(dbtn){
  let dcontainer = dbtn.parentElement;
  dbtn.remove();

  dcontainer.classList.add("delete-container-y-expanded");

  let msg = document.createElement('div');
  msg.setAttribute("class", "delete-messege");
  msg.innerHTML = "delete wikispot permanently?";
  dcontainer.appendChild(msg);

  let xcon = document.createElement('div');
  xcon.setAttribute("class", "delete-container-x");
  dcontainer.appendChild(xcon);

  let ybtn = document.createElement('div');
  ybtn.setAttribute("class", "delete-btn-yes");
  ybtn.setAttribute("onClick", "deleteCard(this)");
  ybtn.innerHTML = "yes";
  xcon.appendChild(ybtn);

  let nbtn = document.createElement('div');
  nbtn.setAttribute("class", "delete-btn-no");
  nbtn.setAttribute("onClick", "cancelDelete(this)"); // these are setting univerasally, need to pass specific instance instead
  nbtn.innerHTML = "cancel";
  xcon.appendChild(nbtn);

}

function deleteCard(yesbtn){
  let card = yesbtn.parentElement.parentElement.parentElement;
  let title = card.querySelector(".cardText").innerHTML;
  let uniKey = usersWikisTitlesAndKeys[title];
  
  console.log(uniKey);
  dbRefUserSpots.child(uniKey).remove();
  //card.remove();
  delete usersWikisTitlesAndKeys[title];
  console.log(usersWikisTitlesAndKeys);
  
  
  if(showUserWikis && usersWikis.length == 0){
    initialTab = true;
    switchCardList();
  }
  buildCardList();
}

function cancelDelete(nobtn){
  
  let xcon = nobtn.parentElement;
  let ycon = xcon.parentElement;
  ycon.querySelector(".delete-messege").remove();
  ycon.querySelector(".delete-container-x").remove();
  /*msg.remove();
  ybtn.remove();
  nbtn.remove();
  xcon.remove();*/

  ycon.classList.remove("delete-container-y-expanded");

  let delbtn = document.createElement('div');
  delbtn.setAttribute("class", "button delete-btn");
  delbtn.setAttribute("onClick", "confirmDelete(this)");
  delbtn.innerHTML = "remove";
  ycon.appendChild(delbtn);

}

function makeWikiLink(title) {
  let link = "https://en.wikipedia.org/wiki/" + title.replaceAll(" ", "_").replaceAll("'", "%27");
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

function clearCardList(){
  document.querySelectorAll(".wikicard").forEach(wc => wc.remove());
  let bt = document.querySelector(".bottom-text");
  let tbc = document.querySelector(".tab-btn-container");
  (bt ? bt.remove() : "");
  (tbc ? tbc.remove() : "");
}

window.onload = init;