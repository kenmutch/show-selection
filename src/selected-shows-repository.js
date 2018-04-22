const AWS = require('aws-sdk')
module.exports = function(options) {

    AWS.config.update({
        region: ((options && options.region) ? options.region: 'ap-southeast-2')
    });
    AWS.config.setPromisesDependency(Promise);
    const docClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
    const tableName = options.tableName;

    return {
        listSelectedShows: listSelectedShows
    }

    function listSelectedShows(username) {

        var params = {
            TableName: "ShowSelections",
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
}