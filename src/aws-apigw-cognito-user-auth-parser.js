urldecode = require('urldecode');
module.exports = function(options) {
    return function(req, res, next) {
        
        try {
            const gatewayEvent = JSON.parse(urldecode(req.headers['x-apigateway-event']));
            console.log('gatewayEvent', gatewayEvent);
            var requestContext = gatewayEvent.requestContext
            console.log('authContext', requestContext);
            var claims = requestContext.authorizer.claims;
            console.log('claims', claims);
            next();
        }
        catch(e) {
            console.error(e);
            next();
        }
    }
}