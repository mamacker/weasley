var express = require('express')
var app = express()

app.get('/go', function (req, res) {
  res.end();
})

app.get('/stop', function (req, res) {
  res.end();
})

app.listen(8080, function () {
  console.log('Example app listening on port 8080!')
})
