const AWS = require('aws-sdk');
const tableDefinition = require('./table-definition.json');
const Promise = require('bluebird');

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region:'ap-southeast-2',
    endpoint: 'http://localhost:8000'
});
AWS.config.setPromisesDependency(Promise);
const DB = new AWS.DynamoDB({apiVersion: '2012-10-08'});

describe('Selected Show Repository', () => {

    before(() => {
        return DB.createTable(tableDefinition).promise();
    });

    after(() => {
        return DB.deleteTable({TableName:tableDefinition.TableName}).promise();
    });

    beforeEach(() => {
        const data = require('./fixtures.json');
        return Promise.map(data, (item) => {
            return DB.putItem({
                Item: {
                    "id": {
                        S: item.id
                    },
                    "username": {
                        S: item.username                    
                    },
                    "showId": {
                        S: item.showId
                    }
                },
                TableName: tableDefinition.TableName
            }).promise();
        });
    });

    it('should list shows selected by a user', () => {

    });
});