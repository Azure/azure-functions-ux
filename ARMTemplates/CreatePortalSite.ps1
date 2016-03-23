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

foreach ($e in $values.value)
{
    $location = $e.location
    $name = $e.name
    Select-AzureRmSubscription -SubscriptionName "Websites migration"
    $appLocation = "MSFT$location"
    $storageName = $name -replace "-", ""
    If ($name -eq "functions-db3") 
    {
        $storageName += "1"
    }
    $Subscription = (Get-AzureRmContext).Subscription.SubscriptionId
    $farmId = "/subscriptions/$Subscription/resourceGroups/Default-Web-$appLocation/providers/Microsoft.Web/serverfarms/Default1"
    New-AzureRmResourceGroup -Name $name -Location $location -Force
    New-AzureRmResourceGroupDeployment -ResourceGroupName $name -appLocation $appLocation -TemplateFile FunctionsPortal.json -appName $name -appServicePlanId $farmId -storageAccountName $storageName -Force
}