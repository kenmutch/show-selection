module.exports = {
    appName: process.env.APP_NAME,
    logLevel: process.env.LOG_LEVEL,
    aws: {
        region: process.env.REGION
    },
    dynamodb: {
        tableName: process.env.TABLE_NAME,
        endpoint: process.env.DYNAMODB_ENDPOINT
    },
    sns: {
        endpoint: process.env.SNS_ENDPOINT,
        showSelectedEventsTopicArn: process.env.SHOW_SELECTED_EVENTS_TOPIC_ARN,
        showUnselectionEventsTopicArn: process.env.SHOW_UNSELECTED_EVENTS_TOPIC_ARN
    }
}