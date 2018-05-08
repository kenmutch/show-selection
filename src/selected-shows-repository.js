const AWS = require('aws-sdk')
const Promise = require('bluebird');
const logger = require('./bunyan-log-provider').getLogger();

module.exports = function(options) {

    AWS.config.update({
        region: ((options && options.region) ? options.region: 'ap-southeast-2')
    });
    AWS.config.setPromisesDependency(Promise);
    const docClient = new AWS.DynamoDB.DocumentClient({
        apiVersion: '2012-08-10',
        endpoint: process.env.DYNAMODB_ENDPOINT
    });
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

    function addSelectedShow(username, showId) {
        var params = {
            TableName: tableName,
            Item: {
                "username": username,
                "showId": showId
            }
        };

        return docClient.put(params).promise()
            .then((data) => {
                return true;
            });
    }

    function deleteSelectedShow(username, showId) {
        var params = {
            TableName: tableName,
            Key: {
                username: username,
                showId: showId
            }
        };

        return docClient.delete(params).promise()
            .then(() => {
                return {showId: showId};
            });
    }
}