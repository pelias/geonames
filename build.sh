#!/usr/bin/env bash
if [ $# -eq 0 ]
  then
    tag='geonames-mil'
  else
    tag=$1
fi

docker build -t venicegeo:$tag .
