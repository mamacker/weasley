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
