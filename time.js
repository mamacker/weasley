var player = require('play-sound')(opts = {})
var gDuration = 3100;
function playGongOnce(timeout) {
  if (!timeout) { timeout = gDuration; }
  player.play("/home/pi/weasley/gong.mp3", {timeout:timeout});
}

function playGong(times) {
  for (var i = 0; i < times; i++) {
    setTimeout(playGongOnce, i * gDuration - 100);
  }
}

playGong(2);
