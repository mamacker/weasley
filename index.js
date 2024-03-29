var ping = require('ping');
var https = require('https');
var fs = require('fs');
var player = require('play-sound')(opts = { players: ['mpg123'] })
const FauxMo = require('fauxmojs');
const os = require('os');
const dns = require('dns');

let ipAddress = '';
dns.lookup(os.hostname() + ".local", (e, a, f) => {
  console.log("IP address: ", a, "Errors: ", e); ipAddress = a;
  let fauxMo = new FauxMo({
    ipAddress: ipAddress,
    devices: [{
      name: 'weasley',
      port: 11000,
      handler: (action) => {
        console.log('Weasley:', action);
        https.get('https://theamackers.com/weasley/set?which=dad&where=work', (res) => { });
        https.get('https://theamackers.com/weasley/set?which=mom&where=exercise', (res) => { });
        https.get('https://theamackers.com/weasley/set?which=cole&where=friends', (res) => { });
        https.get('https://theamackers.com/weasley/set?which=grant&where=school', (res) => { });

        setTimeout(() => {
          https.get('https://theamackers.com/weasley/set?which=dad&where=home', (res) => { });
          https.get('https://theamackers.com/weasley/set?which=mom&where=home', (res) => { });
          https.get('https://theamackers.com/weasley/set?which=cole&where=home', (res) => { });
          https.get('https://theamackers.com/weasley/set?which=grant&where=home', (res) => { });
        }, 10000);
      }
    }
    ]
  });
});

var storedData = {};
var isDst = require('dst');
var targets = ["192.168.1.102", "192.168.1.151"];
setInterval(() => {
  var handle = https.get('https://theamackers.com/weasley/all', (res) => {
    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      try {
        const parsedData = JSON.parse(rawData);
        //console.log("Data from weasley service: ", parsedData);
        var writeCt = 0;
        for (var value in parsedData) {
          if (parsedData[value] != storedData[value]) {
            writeCt++;
            setTimeout(((value, parsedData) => {
              return () => {
                var update = value + " " + parsedData[value];
                var wstream = fs.createWriteStream('/home/pi/weasley/servofifo.pipe', { flags: 'w', autoClose: true });
                wstream.write(update + '\n');
                wstream.close();
              };
            })(value, parsedData), writeCt * 1000);
            storedData[value] = parsedData[value];
          }
        }
      } catch (e) {
        console.error(e.message);
      }
    });
    res.on('error', (err) => {
      console.log(err, err.stack);
    });
  }).on('error', (err) => {
    console.log(err, err.stack);
  });

  handle.on('error', function (err) {
    console.log("Error trying to connect: ", err);
  });
}, 3000);

function handlePhone(target) {
  try {
    switch (target) {
      case targets[0]:
        https.get('https://theamackers.com/weasley/set?which=dad&where=home', (res) => { });
        console.log(target + ": Alive");
        break;
      case targets[1]:
        https.get('https://theamackers.com/weasley/set?which=mom&where=home', (res) => { });
        console.log(target + ": Alive");
        break;
    }
  } catch (ex) { console.log(ex); }
}

async function pingPhone(target) {
  let res = await ping.promise.probe(target, {
    timeout: 10
  });
  if (res.alive) {
    handlePhone(target);
  }
}

function checkForPhones() {
  for (var i = 0; i < targets.length; i++) {
    pingPhone(targets[i]);
  }
}
// USe the phone's reserved IP addresses to discover if Matt or Roxanne are home.
setInterval(() => {
  checkForPhones();
}, 10000);
checkForPhones();

var gDuration = 4000;
function playGongOnce(timeout) {
  if (!timeout) { timeout = gDuration; }
  player.play("/home/pi/weasley/gong.mp3", { timeout: timeout });
}

let curPlaying = false;
async function playFile(filename) {
  return new Promise((res, rej) => {
    if (curPlaying) {
      res();
      return;
    }

    curPlaying = true;

    player.play(filename, (err) => {
      if (err) { rej(err); curPlaying = false; }
      else {
        console.log("waiting for audio to be done...");
        setTimeout(() => {
          curPlaying = false;
          res();
        }, 20000);
      }
    });
  });
}

async function playGongForHour(hour) {
  console.log("Playing file: ", hour);
  return playFile("/home/pi/weasley/gongs" + hour + ".mp3");
}

setInterval(async () => {
  var now = new Date();
  var hours = now.getHours();

  if (isDst(now) && false) {
    hours -= 1;
  }

  // Might have wrapped.
  if (hours < 0) {
    hours += 24;
  }

  console.log("Hours: ", hours, now.getMinutes(), now.getSeconds());

  if (hours > 7 && hours < 22) {
    if (now.getMinutes() == 0 && now.getSeconds() <= 10) {
      if (hours > 12) {
        hours = hours - 12;
      }
      await playGongForHour(hours);
    }
    if (now.getMinutes() == 30 && now.getSeconds() <= 10) {
      await playFile("/home/pi/weasley/halfgong.mp3");
    }
  }
}, 10000);

process.on('uncaughtException', function (err) {
  console.log('----------------------------------------------------------------------');
  console.log('----------------------------------------------------------------------');
  console.log('Caught exception: ' + err);
  console.log(err.stack);
  console.log('----------------------------------------------------------------------');
  console.log('----------------------------------------------------------------------');
});
