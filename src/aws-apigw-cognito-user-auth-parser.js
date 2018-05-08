urldecode = require('urldecode');
const logger = require('./bunyan-log-provider').getLogger();

module.exports = function(options) {
    return function(req, res, next) {
        try {
            const gatewayEvent = JSON.parse(urldecode(req.headers['x-apigateway-event']));
            var authContext = gatewayEvent.requestContext.authorizer
            req.authContext = authContext
            logger.debug(`Set authcontext onto request: ${JSON.stringify(authContext)}`);
            next();
        }
        catch(e) {
            logger.error(e)
            next();
        }
    }
}