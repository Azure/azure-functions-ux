#!/bin/sh
cd server
node_modules/.bin/nodemon --config nodemon-unix.json &
gulp build-all &
cd ../AzureFunctions.AngularClient/
ng build -w &
wait