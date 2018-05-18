const AWS = require('aws-sdk');
const Promise = require('bluebird');
const should = require('should');
const supertest = require('supertest'); 
const fse = require('fs-extra');
const path = require('path')
const JsonTemplateParser = require('json-templates');

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.REGION
});

AWS.config.setPromisesDependency(Promise);
const DB = new AWS.DynamoDB({
    apiVersion: '2012-10-08',
    endpoint: process.env.DYNAMODB_ENDPOINT
});

should.Assertion.add('theEqualSetOf', function (other) {   //must use 'function' here, as '=>' changes the meaning of 'this'
    this.params = {operation: 'should contain the same items'}
    this.obj.should.containDeep(other);
    other.should.containDeep(this.obj);
});

describe('Show Selection API Specs', () => {
    const app = require('../src/app');
    const request = supertest(app);
    const utils = require('./utils');
    const tableName = process.env.TABLE_NAME;

    const SelectedShowsRepository = require('../src/selected-shows-repository')({tableName});
    const tableDefinition = JSON.parse(loadFromTemplate(
        path.resolve(__dirname, 'table-definition.json'), 
        {tableName:tableName}
    ));
  
    const items = require('./table-items.json');

    before(() => {
        return DB.createTable(tableDefinition).promise();
    });

    after(() => {
        return DB.deleteTable({TableName:tableDefinition.TableName}).promise();
    });

    afterEach(() => {
        return wipeDB();
    })

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

        it('should list shows selected by a user', () => {
            const username = 'foo';
            const selectedShowsOfUserFoo = items.filter(item => item.username === username);
            return request
                .get('/selected-shows')
                .set('x-apigateway-event', utils.generateCognitoHeader(username))
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .then((result) => {
                    return result.body.selectedShows
                        .should.be.theEqualSetOf(selectedShowsOfUserFoo);
                });            
        });

        it('should return an empty array when user has not selected any shows', () => {
            const username = 'nobody';
            const selectedShowsOfUserFoo = items.filter(item => item.username === username);
            return request
                .get('/selected-shows')
                .set('x-apigateway-event', utils.generateCognitoHeader(username))
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .then((result) => {
                    return result.body.selectedShows
                        .should.be.theEqualSetOf([]);
                }); 
        });
    });

    describe('adding a selected show', () => {

        it('should add a selected show when the user has selected it', () => {
            const username = 'foo';
            const showId = 'show-z';
            const item = {
                username: username,
                showId: showId
            };
            return request
                .post('/selected-shows')
                .send({showId: showId})
                .set('x-apigateway-event', utils.generateCognitoHeader(username))
                .set('Content-Type', 'application/json')
                .expect(204)
                .then(() => {
                    return request
                        .get('/selected-shows')
                        .set('x-apigateway-event', utils.generateCognitoHeader(username))
                        .expect(200)
                        .expect('Content-Type', 'application/json; charset=utf-8')
                        .then((result) => {
                            return result.body.selectedShows
                                .should.be.theEqualSetOf([item]);
                        });
                });
        });
    });

    describe('unselecting a show', () => {

        const username = 'foo';
        const showId = 'show-z'
        const item = {
            username: username,
            showId: showId
        };

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

        it('should delete a selected show when the user unselects it', () => {
            const unselectedItem = items[0];
            return request
                .delete('/selected-shows/' + unselectedItem.showId)
                .set('x-apigateway-event', utils.generateCognitoHeader(username))
                .expect(200)
                .then(() => {
                    return request
                        .get('/selected-shows')
                        .set('x-apigateway-event', utils.generateCognitoHeader(username))
                        .then((response) => {
                            const remainingSelections = response.body.selectedShows;
                            return remainingSelections.should.not.containEql(unselectedItem);
                        });
                });
        });

        it('should return the unselected show after deleting it', () => {
            const showThatWasUnselected = items[0];
            return request
                .delete('/selected-shows/' + showThatWasUnselected.showId)
                .set('x-apigateway-event', utils.generateCognitoHeader(username))
                .expect(200)
                .then((result) => {
                    console.log('result.body', result.body);
                    return result.body.unselectedShow
                        .should.eql({showId: showThatWasUnselected.showId});
                });
        })
    });

    function wipeDB() {
        return DB.scan({TableName: tableName}).promise()
            .then((res) => {
                return Promise.map(res.Items, (item) => {
                    return DB.deleteItem({
                        Key: {
                            "username": {
                                S: item.username.S
                            },
                            "showId": {
                                S: item.showId.S
                            }
                        },
                        TableName: tableDefinition.TableName
                    }).promise();
                });
            });
    }
});

function loadFromTemplate(path, params) {
    console.log('cwd', process.cwd());
    const template = JsonTemplateParser(fse.readFileSync(path, {encoding:'utf8'}));
    return template(params);
}
