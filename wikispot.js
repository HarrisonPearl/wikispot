let compassCircle;
let myPoint;
let compass;
let isIOS;

function init() {
  compassCircle = document.querySelector(".compass-circle");
  startBtn = document.querySelector(".start-btn");
  myPoint = document.querySelector(".my-point");
  isIOS = (
    navigator.userAgent.match(/(iPod|iPhone|iPad)/) &&
    navigator.userAgent.match(/AppleWebKit/)
  );

  startCompass();
}

function startCompass() {
  if (isIOS) {
    DeviceOrientationEvent.requestPermission()
      .then((response) => {
        if (response === "granted") {
          window.addEventListener("deviceorientation", handler, true);
        } else {
          alert("has to be allowed!");
        }
      })
      .catch(() => alert("not supported"));
  } else {
    window.addEventListener("deviceorientationabsolute", handler, true);
  }
}

function handler(e) {
  compass = e.webkitCompassHeading || Math.abs(e.alpha - 360);
  compassCircle.style.transform = `translate(-50%, -50%) rotate(${-compass}deg)`;
}

window.onload = init;