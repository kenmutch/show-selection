const AWS = require('aws-sdk');
const Promise = require('bluebird');
const should = require('should');

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region:'ap-southeast-2',
    endpoint: 'http://localhost:8000'
});
AWS.config.setPromisesDependency(Promise);
const DB = new AWS.DynamoDB({apiVersion: '2012-10-08'});

should.Assertion.add('equalSet', function (other) {   //must use 'function' here, as '=>' changes the meaning of 'this'
    this.params = {operation: 'should contain the same items'}
    this.obj.should.containDeep(other);
    other.should.containDeep(this.obj);
});

describe('Selected Show Repository', () => {

    const SelectedShowsRepository = require('../src/selected-shows-repository')({tableName: 'ShowSelections'})
    const tableDefinition = require('./table-definition.json');
    const items = require('./table-items.json');

    before(() => {
        return DB.createTable(tableDefinition).promise();
    });

    after(() => {
        return DB.deleteTable({TableName:tableDefinition.TableName}).promise();
    });

    beforeEach(() => {

        return Promise.map(items, (item) => {
            return DB.putItem({
                Item: {
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
        const username = 'foo';
        const expectedShows = items.filter(item => item.username === username);
        return SelectedShowsRepository.listSelectedShows(username)
            .then((shows) => {
                return shows.should.equalSet(expectedShows);
            });
    });
});