const AWS = require('aws-sdk')
const Promise = require('bluebird');
const logger = require('./bunyan-log-provider').getLogger();

module.exports = function(options) {
    options = options || {};

    AWS.config.update({
        region: options.region ? options.region: 'ap-southeast-2'
    });
    AWS.config.setPromisesDependency(Promise);
    
    const docClient = createDocClient(options);
    const tableName = options.tableName;

    return {
        listSelectedShows: listSelectedShows,
        addSelectedShow: addSelectedShow,
        deleteSelectedShow: deleteSelectedShow
    }

    function listSelectedShows(username) {

        var params = {
            TableName: tableName,
            KeyConditionExpression: "username = :username",
            ExpressionAttributeValues: {
                ":username": username
            }
        };
          
        return docClient.query(params).promise()
            .then((data) => {
                return data.Items;
            });
    }

    function addSelectedShow(username, showSlug) {
        var params = {
            TableName: tableName,
            Item: {
                "username": username,
                "showSlug": showSlug
            }
        };

        return docClient.put(params).promise()
            .then((data) => {
                return true;
            });
    }

    function deleteSelectedShow(username, showSlug) {
        var params = {
            TableName: tableName,
            Key: {
                username: username,
                showSlug: showSlug
            }
        };

        return docClient.delete(params).promise()
            .then(() => {
                return {showSlug: showSlug};
            });
    }
}

function createDocClient(options) {
    if (options.endpoint) {
        return new AWS.DynamoDB.DocumentClient({
            apiVersion: '2012-08-10',
            endpoint: options.endpoint
        });
    }
    else {
        return new AWS.DynamoDB.DocumentClient({
            apiVersion: '2012-08-10'
        });
    };
}