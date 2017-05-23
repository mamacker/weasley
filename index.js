var ping = require('./node_modules/node-net-ping/');
var https = require('https');
var fs = require('fs');
var storedData = {};
setInterval(() => {
  https.get('https://theamackers.com/weasley/all', (res) => {
    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      try {
        const parsedData = JSON.parse(rawData);
        var writeCt = 0;
        for (var value in parsedData) {
          if (parsedData[value] != storedData[value]) {
            writeCt++;
            setTimeout(((value, parsedData) => {
              return () => {
                var update = value + " " + parsedData[value];
                var wstream = fs.createWriteStream('/home/pi/weasley/servofifo.pipe', {flags: 'w', autoClose: true});
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
  });
}, 3000);

function checkForPhones() {
  var mattSession = ping.createSession({retries:5});
  mattSession.on('error', function(eror) {
    console.trace(error.toString());
  });
  var mattTarget = "192.168.1.164"
  mattSession.pingHost (mattTarget, function (error, target) {
    if (error) {
      console.log (target + ": ", error);// + error.toString ());
    }
    else {
      https.get('https://theamackers.com/weasley/set?which=dad&where=home', (res) => {
      });
      console.log (target + ": Alive");
    }
  });

  setTimeout(() => {
    var roxanneSession = ping.createSession({retries:5});
    var roxanneTarget = "192.168.1.96"
    roxanneSession.pingHost (roxanneTarget, function (error, target) {
      if (error) {
        console.log (target + ": ", error);// + error.toString ());
      } else {
        https.get('https://theamackers.com/weasley/set?which=mom&where=home', (res) => {
        });
        console.log (target + ": Alive");
      }
    });
  },5000);
}
// USe the phone's reserved IP addresses to discover if Matt or Roxanne are home.
setInterval(() => {
  checkForPhones();
}, 30000);
checkForPhones();
