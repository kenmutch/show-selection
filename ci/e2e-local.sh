#!/bin/bash

export DYNAMODB_ENDPOINT='http://localhost:8000'
export AWS_ACCESS_KEY_ID=$(grep -i "aws_access_key_id" ~/.aws/credentials | cut -d "=" -f 2)
export AWS_SECRET_ACCESSKEY=$(grep -i "aws_secret_access_key" ~/.aws/credentials | cut -d "=" -f 2)
export REGION='ap-southeast-2'
export TABLE_NAME='ShowSelectionsLocal'
CONTAINER_NAME=dynamodb-local

if ! docker ps | grep -q $CONTAINER_NAME; then
    echo "container '$CONTAINER_NAME' is not running, so starting it"
    docker run -d -p 8000:8000 --name $CONTAINER_NAME dmwkerr/dynamodb
fi
./node_modules/.bin/mocha --recursive e2e