// 1. BPM CALCULATOR

// Credits: https://taptempo.net/

var tapTime = [];
var firstTap = true;
var inactivity = 0;

function calculateBPM() {
  //Cancels inactivity detector, hides inactivity alert:
  clearTimeout(inactivity);
  if (!$(".reset-alert p").hasClass("hide")) {
    $(".reset-alert p").addClass("hide");
  }
  let addTap;
  let removeTap;

  //Checks if it is the 1st tap/click/key press, and skips calculation until there are at least 2 taps:
  if (firstTap === true) {
    firstTap = false;
    addTap = tapTime.unshift(Date.now());
    $(".result-bpm").text("0");
  } else {
    //Calculates average bpm based on last <= 4 taps:
    addTap = tapTime.unshift(Date.now());

    if (tapTime.length > 4) {
      removeTap = tapTime.pop();
    }

    let averageBPM = Math.round(
      ((tapTime.length - 1) / (tapTime[0] - tapTime[tapTime.length - 1])) *
        60000
    );
    $(".result-bpm").text(averageBPM);
  }

  //Activates inactivity detector:
  inactivity = setTimeout(detectInactivity, 60000);
}

//Resets all values when the "start over" button is pressed, hides the inactivity alert:
function reset() {
  clearTimeout(inactivity);

  $(".result-bpm").text("");
  firstTap = true;
  tapTime = [];
  $(".reset-button").blur();
  if (!$(".reset-alert p").hasClass("hide")) {
    $(".reset-alert p").addClass("hide");
  }
}

//Runs if there were no taps for over 60sec, shows the inactivity alert and resets the values:
function detectInactivity() {
  $(".reset-alert p").removeClass("hide");
  firstTap = true;
  tapTime = [];
}

//Event listeners:
$(".tapping-area").on("click", calculateBPM);
$("body").on("keypress", calculateBPM);
$(".reset-button").on("click", reset);