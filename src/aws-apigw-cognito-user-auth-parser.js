urldecode = require('urldecode');
module.exports = function(options) {
    return function(req, res, next) {
        
        try {
            const gatewayEvent = JSON.parse(urldecode(req.headers['x-apigateway-event']));
            console.log('gatewayEvent', gatewayEvent);
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