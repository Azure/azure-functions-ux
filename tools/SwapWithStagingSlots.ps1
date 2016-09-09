# make sure the script stops if one of the swaps failed
$ErrorActionPreference = "Stop"

Select-AzureRmSubscription -SubscriptionName "Websites migration"

$ParametersObject = @{
  targetSlot = "staging"
}

"functions-bay", "functions-blu", "functions-db3", "functions-hk1" | %{
  $scriptBlock = {
    param($siteName)
    Write-Host "swapping $siteName ..."
    Invoke-AzureRmResourceAction -ResourceGroupName $siteName -ResourceType Microsoft.Web/sites -ResourceName $siteName -Action slotsswap -Parameters $ParametersObject -ApiVersion 2015-08-01 -Force
  }
  Write-Host "processing $_..."
  Start-Job $scriptBlock -ArgumentList $_
}

While (Get-Job -State "Running") { Start-Sleep 2 }

Get-Job | Receive-Job

Remove-Job *

Write-Host Done Swapping all sites


$ParametersObject = @{
  ContentPaths = @("/*")
}

#Write-Host Flushing the CDN
#Invoke-AzureRmResourceAction -ResourceGroupName functions-bay -ResourceType Microsoft.Cdn/profiles/endpoints -ResourceName azure-functions/functions -Action purge -Parameters $ParametersObject -ApiVersion 2015-06-01 -Force

#Write-Host Flushing is complete
