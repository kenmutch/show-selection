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

should.Assertion.add('theEqualSetOf', function (other) {   //must use 'function' here, as '=>' changes the meaning of 'this'
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

    describe('listing selected shows', () => {

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

        afterEach(() => {
            return Promise.map(items, (item) => {
                return DB.deleteItem({
                    Key: {
                        "username": {
                            S: item.username
                        },
                        "showId": {
                            S: item.showId
                        }
                    },
                    TableName: tableDefinition.TableName
                }).promise();
            })
        })

        it('should list shows selected by a user', () => {
            const username = 'foo';
            const selectedShowsOfUserFoo = items.filter(item => item.username === username);
            return SelectedShowsRepository.listSelectedShows(username)
                .should.eventually.be.theEqualSetOf(selectedShowsOfUserFoo);
        });

        it('should return an empty array when user has not selected any shows', () => {
            const username = 'nobody';
            return SelectedShowsRepository.listSelectedShows(username)
                .should.eventually.be.theEqualSetOf([]);
        });
    });

    describe('adding a selected show', () => {

        it('should add a selected show when the user has selected it', () => {
            const username = 'foo';
            const item = {
                username: username,
                showId: 'show-z'
            };
            return SelectedShowsRepository.addSelectedShow(item)
                .should.eventually.match(true)
                .then(() => {
                    return SelectedShowsRepository.listSelectedShows(username)
                        .should.eventually.be.theEqualSetOf([item]);
                });
        });

    });

    describe('unselecting a show', () => {

        const username = 'foo';
        const item = {
            username: username,
            showId: 'show-z'
        };

        beforeEach(() => {
            return SelectedShowsRepository.addSelectedShow(item);
        })

        it('should delete a selected show when the user unselects it', () => {
            return SelectedShowsRepository.deleteSelectedShow(username, showId)
                .should.eventually.match(item);
        })
    })


});

