#!/bin/bash

export DYNAMODB_ENDPOINT='http://localhost:8000'
export SNS_ENDPOINT='http://localhost:9911'
export AWS_ACCESS_KEY_ID=$(grep -i "aws_access_key_id" ~/.aws/credentials | cut -d "=" -f 2)
export AWS_SECRET_ACCESSKEY=$(grep -i "aws_secret_access_key" ~/.aws/credentials | cut -d "=" -f 2)
export REGION='ap-southeast-2'
export TABLE_NAME='ShowSelectionsLocal'
export SHOW_SELECTED_EVENTS_TOPIC_ARN='arn:aws:sns:us-east-1:123456789012:show-selected-events'
DYNAMODB_CONTAINER='dynamodb-local'
SNS_CONTAINER='fake-sns'

if ! docker ps | grep -q $DYNAMODB_CONTAINER; then
    echo "container '$DYNAMODB_CONTAINER' is not running, so starting it"
    docker start $DYNAMODB_CONTAINER
fi
if ! docker ps | grep -q $SNS_CONTAINER; then
    echo "container '$SNS_CONTAINER' is not running, so starting it"
    docker start $SNS_CONTAINER
    docker exec $SNS_CONTAINER sh -c "aws sns --region ap-southeast-2 --endpoint-url http://localhost:9911 create-topic --name show-selected-events"
fi
./node_modules/.bin/mocha --recursive e2e