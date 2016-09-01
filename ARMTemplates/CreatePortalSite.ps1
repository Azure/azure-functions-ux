$json = @"
{
    "value": [
        {
            "name": "functions-hk1",
            "location": "EastAsia"
        },
        {
            "name": "functions-bay",
            "location": "WestUS"
        },
        {
            "name": "functions-blu",
            "location": "EastUS"
        },
        {
            "name": "functions-db3",
            "location": "NorthEurope"
        }
    ]
}
"@

$values = $json | ConvertFrom-Json

ForEach ($e in $values.value)
{
    $location = $e.location
    $name = $e.name
    Select-AzureRmSubscription -SubscriptionName "Websites migration"
    $appLocation = "MSFT$location"
    $storageName = $name -replace "-", ""
    $Subscription = (Get-AzureRmContext).Subscription.SubscriptionId
    $farmId = "/subscriptions/$Subscription/resourceGroups/Default-Web-$appLocation/providers/Microsoft.Web/serverfarms/Default1"
    New-AzureRmResourceGroup -Name $name -Location $location -Force
    $appSettings = Invoke-AzureRmResourceAction -ResourceGroupName $name -ResourceType Microsoft.Web/sites/config -ResourceName $name/appsettings -Action list -ApiVersion 2015-08-01 -Force
    $sasUrl = $appsettings.Properties.WEBSITE_HTTPLOGGING_CONTAINER_URL
    $aiInstrumentationKey = $appsettings.Properties.aiInstrumentationKey
    New-AzureRmResourceGroupDeployment -ResourceGroupName $name -appLocation $appLocation -TemplateFile FunctionsPortal.json -appName $name -appServicePlanId $farmId -storageAccountName $storageName -sasUrl $sasUrl -aiInstrumentationKey $aiInstrumentationKey -Force
}
