#!/bin/sh

cd /usr/local/app

while ! mysqladmin ping -h"$MYSQL_HOST" --silent; do
    sleep 1
done

MYSQL_URL="mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@${MYSQL_HOST}:3306/${MYSQL_DB}" ./file_storage_server
