const AWS = require('aws-sdk')
const Promise = require('bluebird');

module.exports = function(eventBus, options){

    options = options || {};
    AWS.config.update({
        region: (options.region ? options.region: 'ap-southeast-2')
    });
    AWS.config.setPromisesDependency(Promise);
    const SNS = createSnsClient(options);

    eventBus.on('show.selected', (event) => {
        console.log('A show was selected: ' + JSON.stringify(event));
        publish(options.showSelectionEventsTopicArn, event);
    });

    function publish(snsTopicArn, event) {
        const message = JSON.stringify({default:event});
        SNS.publish({
            Message: message,
            TargetArn: snsTopicArn,
        }).promise()
        .then((data) => {
            console.log(`published message of '${message}' to ${snsTopicArn} and the response was ${data}`);
        })
        .catch((err) => {
            console.error(`error publishing message of '${message}' to ${snsTopicArn}`, err);
        })
    }
}

function createSnsClient(options) {
    console.log(`Creating sns client with endpoint of ${options.endpoint}`);
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