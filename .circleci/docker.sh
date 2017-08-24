#!/bin/bash
# collect params from ENV vars
DATE=`date +%Y-%m-%d`
DOCKER_REPOSITORY=pelias
DOCKER_IMAGE_VERSION="${CIRCLE_BRANCH}-${DATE}-${CIRCLE_SHA1}"
DOCKER_IMAGE_NAME=${DOCKER_REPOSITORY}/$CIRCLE_PROJECT_REPONAME:${DOCKER_IMAGE_VERSION}

# build and push to docker hub
docker build -t $DOCKER_IMAGE_NAME .
docker login -u="$DOCKER_USERNAME" -p="$DOCKER_PASSWORD"
docker push $DOCKER_IMAGE_NAME
