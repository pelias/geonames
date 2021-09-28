# base image
FROM pelias/baseimage

# ensure data dirs exists
RUN mkdir -p '/data/geonames'

# downloader apt dependencies
# note: this is done in one command in order to keep down the size of intermediate containers
RUN apt-get update && apt-get install -y bzip2 unzip && rm -rf /var/lib/apt/lists/*

# change working dir
ENV WORKDIR=/code/pelias/geonames
WORKDIR $WORKDIR

# copy files needed to update metadata, as it's called with NPM install
COPY ./bin/updateMetadata.js $WORKDIR/bin/updateMetadata.js
COPY ./lib/tasks/meta.js ./lib/tasks/metafiles.json $WORKDIR/lib/tasks/

# copy package.json first to prevent npm install being rerun when only code changes
COPY ./package.json ${WORKDIR}
RUN npm install

# Copy code into image
ADD . $WORKDIR

# run tests
RUN npm test

# run as the pelias user
USER pelias
