const express = require('express');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const authParser  = require('./aws-apigw-cognito-user-auth-parser');
const _get = require('lodash.get');
const app = express();

app.use(authParser());
app.use(awsServerlessExpressMiddleware.eventContext())

app.get('/selected-shows', (req, res) => {
  res.send({
    "Output": "Hello " + _get(req, 'authContext.claims.username', 'anonymous'),
    "ApiGwEvent": _get(req, 'apiGateway.event', 'no gateway event found')
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
