# make sure the script stops if one of the swaps failed
$ErrorActionPreference = "Stop"

Select-AzureRmSubscription -SubscriptionName "Websites migration"

$ParametersObject = @{
  targetSlot = "staging"
}

Write-Host swapping bay site ....
Invoke-AzureRmResourceAction -ResourceGroupName functions-bay -ResourceType Microsoft.Web/sites -ResourceName functions-bay -Action slotsswap -Parameters $ParametersObject -ApiVersion 2015-08-01 -Force

Write-Host swapping blu site ....
Invoke-AzureRmResourceAction -ResourceGroupName functions-blu -ResourceType Microsoft.Web/sites -ResourceName functions-blu -Action slotsswap -Parameters $ParametersObject -ApiVersion 2015-08-01 -Force

Write-Host swapping db3 site ....
Invoke-AzureRmResourceAction -ResourceGroupName functions-db3 -ResourceType Microsoft.Web/sites -ResourceName functions-db3 -Action slotsswap -Parameters $ParametersObject -ApiVersion 2015-08-01 -Force

Write-Host swapping hk1 site ....
Invoke-AzureRmResourceAction -ResourceGroupName functions-hk1 -ResourceType Microsoft.Web/sites -ResourceName functions-hk1 -Action slotsswap -Parameters $ParametersObject -ApiVersion 2015-08-01 -Force

Write-Host Done Swapping all sites


$ParametersObject = @{
  ContentPaths = @("/*")
}

Write-Host Flushing the CDN
Invoke-AzureRmResourceAction -ResourceGroupName functions-bay -ResourceType Microsoft.Cdn/profiles/endpoints -ResourceName azure-functions/functions -Action purge -Parameters $ParametersObject -ApiVersion 2015-06-01 -Force

Write-Host Flushing is complete
