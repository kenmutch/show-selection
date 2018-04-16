
exports.listSelectedShows = (event, context, callback) => {
    response = {
        statusCode: 200,
        body: 'This is where the shows would be'
    }
    callback(null, response);
}