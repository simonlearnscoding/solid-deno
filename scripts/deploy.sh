#!/usr/bin/env bash
set -e
git pull origin master
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
sudo systemctl  restart app-stack
