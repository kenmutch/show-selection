const AWS = require('aws-sdk')
const Promise = require('bluebird');
const logger = require('./bunyan-log-provider').getLogger();

module.exports = function(options){

    options = options || {};
    AWS.config.update({
        region: (options.region ? options.region: 'ap-southeast-2')
    });
    AWS.config.setPromisesDependency(Promise);
    const SNS = createSnsClient(options);

    return {
        notifyShowSelected: (event) => {
            logger.info('A show was selected: ' + JSON.stringify(event));
            return publish(options.showSelectionEventsTopicArn, event);
        },
        notifyShowUnselected: (event) => {
            logger.info('A show was unselected: ' + JSON.stringify(event));
            return publish(options.showUnselectionEventsTopicArn, event);
        }
    }

    function publish(snsTopicArn, event) {
        const message = JSON.stringify({default:event});
        return SNS.publish({
            Message: message,
            TopicArn: snsTopicArn
        }).promise()
        .then((data) => {
            logger.info(`published message of '${message}' to ${snsTopicArn} and the response was ${JSON.stringify(data)}`);
        })
        .catch((err) => {
            logger.info(`error publishing message of '${message}' to ${snsTopicArn}`, err);
            throw err;
        })
    }
}

function createSnsClient(options) {
    logger.debug(`Creating sns client with endpoint of ${options.endpoint}`);
    if(options.endpoint) {
        return new AWS.SNS({
            apiVersion: '2012-08-10',
            endpoint: options.endpoint
        });
    }
    else {
        return new AWS.SNS({
            apiVersion: '2012-08-10'
        });
    }
}