#!/bin/bash
if [ -d "/dumps/quannhu" ] || [ -f "/dumps/quannhu.archive" ]; then
    echo "Restoring MongoDB database 'quannhu'..."
    mongorestore --host localhost --port 27017 -d quannhu /dumps/quannhu
else
    echo "No MongoDB dumps found in /dumps/quannhu."
fi
