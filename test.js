var player = require('play-sound')(opts = { players: ['mpg123'] })
function playFile(filename) {
    player.play(filename, function (err) {
        console.log("Error in playing: ", err);
    });
}

function playGongForHour(hour) {
    playFile("/home/pi/weasley/gongs" + hour + ".mp3");
}

playGongForHour(1);