const AWS = require('aws-sdk')
const Promise = require('bluebird');

module.exports = function(options){

    options = options || {};
    AWS.config.update({
        region: (options.region ? options.region: 'ap-southeast-2')
    });
    AWS.config.setPromisesDependency(Promise);
    const SNS = createSnsClient(options);

    return {
        notifyShowSelected: (event) => {
            console.log('A show was selected: ' + JSON.stringify(event));
            return publish(options.showSelectionEventsTopicArn, event);
        },
        notifyShowUnselected: (event) => {
            console.log('A show was unselected: ' + JSON.stringify(event));
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
            console.log(`published message of '${message}' to ${snsTopicArn} and the response was ${JSON.stringify(data)}`);
        })
        .catch((err) => {
            console.error(`error publishing message of '${message}' to ${snsTopicArn}`, err);
            throw err;
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