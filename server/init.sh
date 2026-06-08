#!/bin/bash
#mongodb import data...
echo "Restoring MongoDB dump..."
mongorestore -u $MONGO_INITDB_ROOT_USERNAME \
             -p $MONGO_INITDB_ROOT_PASSWORD\
             --authenticationDatabase admin \
             ./dump

echo "MongoDB restore completed!"