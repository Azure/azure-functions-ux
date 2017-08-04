#!/bin/sh
cd server
node_modules/.bin/nodemon &
cd ../AzureFunctions.AngularClient/
ng build -w &
wait