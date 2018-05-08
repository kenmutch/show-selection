const express = require('express');
const bodyParser = require('body-parser');
const _get = require('lodash.get');
const Promise = require('bluebird');
const AWSXRay = require('aws-xray-sdk');

const config = require('./config');
const logger = require('./bunyan-log-provider').getLogger(bunyanLogProviderOptions(config));
const authParser = require('./aws-apigw-cognito-user-auth-parser');
const SelectedShowsRepository = require('./selected-shows-repository')(selectedShowRepositoryOptions(config))
const NotificationService = require('./notification-service')(notificationServiceOptions(config));

const app = express();

app.use(AWSXRay.express.openSegment('ShowSelectionService'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(authParser());

app.get('/selected-shows', (req, res) => {
    const username = _get(req, 'authContext.claims.username', 'anonymous');
    SelectedShowsRepository.listSelectedShows(username)
        .then((selectedShows) => {
            res.send({
                selectedShows: selectedShows
            });
        });
});

app.post('/selected-shows', (req, res) => {
    const username = _get(req, 'authContext.claims.username', 'anonymous');
    const showId = req.body.showId;
    logger.debug('about to add a selected show: username:' + username + ', showId:' + showId);
    SelectedShowsRepository.addSelectedShow(username, showId)
        .then(() => {
            const eventData = {showId: showId};
            return NotificationService.notifyShowSelected(eventData);
        })
        .then(() => {
            res.status(204).send('');
        });
});

app.delete('/selected-shows/:showId', (req, res) => {
    const username = _get(req, 'authContext.claims.username', 'anonymous');
    const showId = req.params.showId;
    logger.debug('about to delete a selected show: username:' + username + ', showId:' + showId);
    SelectedShowsRepository.deleteSelectedShow(username, showId)
        .then((unselectedShow) => {
            return NotificationService.notifyShowUnselected(unselectedShow)
                .then(() => {
                    res.status(200).send({
                        unselectedShow: unselectedShow
                    });
                });
        });
});

app.use(AWSXRay.express.closeSegment());


function bunyanLogProviderOptions(config) {
    return {
        logLevel: config.logLevel,
        name: config.appName
    };
}
function notificationServiceOptions(config) {
    return {
        showSelectionEventsTopicArn: config.sns.showSelectedEventsTopicArn,
        showUnselectionEventsTopicArn: config.sns.showUnselectionEventsTopicArn,
        region: config.region,
        endpoint: config.sns.endpoint
    };
}

function selectedShowRepositoryOptions(config) {
    return {
        region: config.region,
        tableName: config.dynamodb.tableName,
        endpoint: config.dynamodb.endpoint
    }
}

module.exports = app
