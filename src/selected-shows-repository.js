const AWS = require('aws-sdk')
module.exports = function(options) {

    AWS.config.update({region: (option.region ? option.region: 'ap-southeast-2')});
    const docClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
    const tableName = options.tableName;

    return {
        listSelectedShows: listSelectedShows
    }

    function listSelectedShows(username) {

        var params = {
            ExpressionAttributeValues: {
                ':username': username
            },
           KeyConditionExpression: 'username = :username',
           TableName: tableName
          };
          
          docClient.query(params, function(err, data) {
            if (err) {
              throw new Error(err);
            } else {
              console.log("Success", data.Items);
            }
          });
        
    }
}