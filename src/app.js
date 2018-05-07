const express = require('express');
const bodyParser = require('body-parser');
const authParser = require('./aws-apigw-cognito-user-auth-parser');
const _get = require('lodash.get');
const app = express();
const Promise = require('bluebird');
const SelectedShowsRepository = require('./selected-shows-repository')({ tableName: process.env.TABLE_NAME })
const AWSXRay = require('aws-xray-sdk');
const NotificationService = require('./notification-service')(notificationServiceOptions());
const logger = require('../bunyan-log-provider').getLogger();

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

function notificationServiceOptions() {
    return {
        showSelectionEventsTopicArn: process.env.SHOW_SELECTED_EVENTS_TOPIC_ARN,
        showUnselectionEventsTopicArn: process.env.SHOW_UNSELECTED_EVENTS_TOPIC_ARN,
        region: process.env.REGION,
        endpoint: process.env.SNS_ENDPOINT
    };
}

module.exports = app
