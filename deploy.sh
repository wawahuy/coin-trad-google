#!/usr/bin/env bash

# image docker
image=zayuh/coin

# build image
docker rmi $image:build || true
docker build -t $image:build .

# docker compose run
docker-compose stop
docker-compose rm -f

docker rmi $image:lasted || true
docker tag $image:build $image:lasted

docker-compose up -d
