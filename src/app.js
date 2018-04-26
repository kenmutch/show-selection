const express = require('express');
const bodyParser = require('body-parser');
const authParser = require('./aws-apigw-cognito-user-auth-parser');
const _get = require('lodash.get');
const app = express();
const Promise = require('bluebird');
const SelectedShowsRepository = require('./selected-shows-repository')({ tableName: process.env.TABLE_NAME })

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
    SelectedShowsRepository.addSelectedShow(username, req.body.showId)
        .then(() => {
            res.status(204).send('');
        });
});

app.delete('/selected-shows/:showId', (req, res) => {
    const username = _get(req, 'authContext.claims.username', 'anonymous');
    SelectedShowsRepository.deleteSelectedShow(username, req.params.showId)
        .then((unselectedShow) => {
            console.log('response', unselectedShow);
            res.status(200).send({
                unselectedShow: unselectedShow
            });
        })
})


// Export your Express configuration so that it can be consumed by the Lambda handler
module.exports = app
