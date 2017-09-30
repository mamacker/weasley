var ping = require('./node_modules/node-net-ping/');
var https = require('https');
var fs = require('fs');
var storedData = {};
var targets = ["192.168.1.164", "192.168.1.96"];
setInterval(() => {
  var handle = https.get('https://theamackers.com/weasley/all', (res) => {
    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      try {
        const parsedData = JSON.parse(rawData);
        console.log("Data from weasley service: ", parsedData);
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
    res.on('error', (err) => {
      console.log(err, err.stack);
    });
  }).on('error', (err) => {
    console.log(err, err.stack);
  });

  handle.on('error', function(err) {
    console.log("Error trying to connect: ", err);
  });
}, 3000);

function handlePhone(target) {
  try {
    switch(target) {
      case targets[0]:
        https.get('https://theamackers.com/weasley/set?which=dad&where=home', (res) => { });
        console.log (target + ": Alive");
        break;
      case targets[1]:
        https.get('https://theamackers.com/weasley/set?which=mom&where=home', (res) => { });
        console.log (target + ": Alive");
        break;
    }
  } catch(ex) { console.log(ex); }
}

function pingPhone(target, session) {
  session.pingHost (target, function (error, target) {
    if (error) {
      console.log (target + ": ", error);// + error.toString ());
    }
    else {
      handlePhone(target);
    }
  });
}

function checkForPhones() {
  var session = ping.createSession({retries:5});
  session.on('error', function(eror) {
    console.trace(error.toString());
  });

  for (var i = 0; i < targets.length; i++) {
    pingPhone(targets[i], session);
  }
}
// USe the phone's reserved IP addresses to discover if Matt or Roxanne are home.
setInterval(() => {
  checkForPhones();
}, 30000);
checkForPhones();

process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err);
    console.log(err.stack);
});
