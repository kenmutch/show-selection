#!/bin/bash

export DYNAMODB_ENDPOINT='http://localhost:8000'
export SNS_ENDPOINT='http://localhost:9325'
export AWS_ACCESS_KEY_ID=$(grep -i "aws_access_key_id" ~/.aws/credentials | cut -d "=" -f 2)
export AWS_SECRET_ACCESSKEY=$(grep -i "aws_secret_access_key" ~/.aws/credentials | cut -d "=" -f 2)
export REGION='ap-southeast-2'
export TABLE_NAME='ShowSelectionsLocal'
export SHOW_SELECTED_EVENTS_TOPIC_ARN='arn:aws:sns:us-east-1:123456789012:show-selected-events'
export SHOW_UNSELECTED_EVENTS_TOPIC_ARN='arn:aws:sns:us-east-1:123456789012:show-unselected-events'
export LOG_LEVEL='DEBUG'
export APP_NAME='show-selection-service'

DYNAMODB_CONTAINER='dynamodb-local'
SNS_CONTAINER='snssqs-mock'


if ! docker ps | grep -q $DYNAMODB_CONTAINER; then
    echo "container '$DYNAMODB_CONTAINER' is not running, so starting it"
    docker start $DYNAMODB_CONTAINER
fi
if ! docker ps | grep -q $SNS_CONTAINER; then
    echo "container '$SNS_CONTAINER' is not running, so starting it"
    docker start $SNS_CONTAINER
fi

./node_modules/.bin/mocha --recursive e2e | ./node_modules/.bin/bunyan