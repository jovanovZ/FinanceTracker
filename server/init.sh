#!/bin/bash
echo "Checking for MongoDB dump..."
if [ "$(ls -A /dump 2>/dev/null)" ]; then
  echo "Restoring MongoDB dump..."
  mongorestore -u "$MONGO_INITDB_ROOT_USERNAME" \
               -p "$MONGO_INITDB_ROOT_PASSWORD" \
               --authenticationDatabase admin \
               /dump
  echo "MongoDB restore completed!"
else
  echo "No dump files found, skipping restore."
fi
