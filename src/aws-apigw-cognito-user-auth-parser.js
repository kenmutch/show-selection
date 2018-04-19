urldecode = require('urldecode');
module.exports = function(options) {
    return function(req, res, next) {
        const gatewayEvent = JSON.parse(urldecode(req.headers['x-apigateway-event']));
        console.log('gatewayEvent', gatewayEvent);
        try {
            var authContext = gatewayEvent.requestContext.Authorizer.claims;
            console.log('authContext', authContext);
            next();
        }
        catch(e) {
            console.error(e);
            next();
        }
    }
}