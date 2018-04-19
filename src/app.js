var express = require('express');
var authParser  = require('./aws-apigw-cognito-user-auth-parser');
var app = express();


app.use(authParser({}));

app.get('/selected-shows', (req, res) => {
  console.log('req.authContext', req.authContext)
  res.send({
    "Output": "Hello World!"
  });
});

app.post('/selected-shows', (req, res) => {
  res.send({
    "Output": "Hello World!"
  });
});

app.delete('/selected-shows/:id', (req, res) => {
  res.send({
    "Output": "This will delete selected show with id of " + req.params.id
  })
})


// Export your Express configuration so that it can be consumed by the Lambda handler
module.exports = app
