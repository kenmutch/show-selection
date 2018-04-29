urldecode = require('urldecode');
module.exports = function(options) {
    return function(req, res, next) {
        try {
            console.log('req.header', req.headers);
            const gatewayEvent = JSON.parse(urldecode(req.headers['x-apigateway-event']));
            var authContext = gatewayEvent.requestContext.authorizer
            req.authContext = authContext
            next();
        }
        catch(e) {
            console.error(e)
            next();
        }
    }
}