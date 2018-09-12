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

# Copy code into image
ADD . $WORKDIR

# install npm dependencies
RUN npm install

# Explicitly download metadata (it will not be downloaded automatically in noninteractive sessions)
RUN npm run download_metadata

# run tests
RUN npm test

# run as the pelias user
USER pelias
