#!/bin/sh
az account set --subscription "Websites migration"

echo "swapping bay site ...."
az webapp deployment slot swap --resource-group functions-bay --name functions-bay --slot staging

echo "swapping blu site..."
az webapp deployment slot swap --resource-group functions-blu --name functions-blu --slot staging

echo "swapping db3 site..."
az webapp deployment slot swap --resource-group functions-db3 --name functions-db3 --slot staging

echo "swapping hk1 site..."
az webapp deployment slot swap --resource-group functions-hk1 --name functions-hk1 --slot staging

echo "swapping india site..."
az webapp deployment slot swap --resource-group functions-india --name functions-india --slot staging

echo "swapping brazil site..."
az webapp deployment slot swap --resource-group functions-brazil --name functions-brazil --slot staging

echo "swapping france site..."
az webapp deployment slot swap --resource-group functions-france --name functions-france --slot staging

echo "swapping australia site..."
az webapp deployment slot swap --resource-group functions-australia --name functions-australia --slot staging

wait