# Change those two lines for other regions
$name = "functions-bay"
$location = "WestUS"

Select-AzureRmSubscription -SubscriptionName "Websites migration"
$appLocation = "MSFT$location"
$storageName = $name -replace "-", ""
$Subscription = (Get-AzureRmContext).Subscription.SubscriptionId
$farmId = "/subscriptions/$Subscription/resourceGroups/Default-Web-$appLocation/providers/Microsoft.Web/serverfarms/Default1"
New-AzureRmResourceGroup -Name $name -Location $location -Force
New-AzureRmResourceGroupDeployment -ResourceGroupName $name -appLocation $appLocation -TemplateFile FunctionsPortal.json -appName $name -appServicePlanId $farmId -storageAccountName $storageName -Force
