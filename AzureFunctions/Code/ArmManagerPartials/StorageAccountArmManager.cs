using AzureFunctions.Code.Extensions;
using AzureFunctions.Common;
using AzureFunctions.Models.ArmModels;
using AzureFunctions.Models.ArmResources;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;

namespace AzureFunctions.Code
{
    public partial class ArmManager
    {
        public async Task<StorageAccount> Load(StorageAccount storageAccount)
        {
            var storageResponse = await _client.PostAsync(ArmUriTemplates.StorageListKeys.Bind(storageAccount), NullContent);
            await storageResponse.EnsureSuccessStatusCodeWithFullError();

            var keys = await storageResponse.Content.ReadAsAsync<Dictionary<string, string>>();
            storageAccount.StorageAccountKey = keys.Select(s => s.Value).FirstOrDefault();
            return storageAccount;
        }

        public async Task<StorageAccount> CreateFunctionsStorageAccount(ResourceGroup resourceGroup)
        {
            var storageAccountName = $"{Constants.FunctionsStorageAccountNamePrefix}{Guid.NewGuid().ToString().Split('-').First()}".ToLowerInvariant();
            var storageAccount = new StorageAccount(resourceGroup.SubscriptionId, resourceGroup.ResourceGroupName, storageAccountName);

            await _client.PostAsJsonAsync(ArmUriTemplates.StorageRegister.Bind(resourceGroup), NullContent);
            var storageResponse = await _client.PutAsJsonAsync(ArmUriTemplates.StorageAccount.Bind(storageAccount), new { location = resourceGroup.Location, properties = new { accountType = "Standard_GRS" } });
            await storageResponse.EnsureSuccessStatusCodeWithFullError();

            var isSucceeded = false;
            var tries = 10;
            do
            {
                storageResponse = await _client.GetAsync(ArmUriTemplates.StorageAccount.Bind(storageAccount));
                await storageResponse.EnsureSuccessStatusCodeWithFullError();
                var armStorageAccount = await storageResponse.Content.ReadAsAsync<ArmWrapper<ArmStorage>>();
                isSucceeded = armStorageAccount.properties.provisioningState.Equals("Succeeded", StringComparison.OrdinalIgnoreCase) ||
                    armStorageAccount.properties.provisioningState.Equals("ResolvingDNS", StringComparison.OrdinalIgnoreCase);
                tries--;
                if (!isSucceeded) await Task.Delay(200);
            } while (!isSucceeded && tries > 0);
            resourceGroup.FunctionsStorageAccount = storageAccount;
            return storageAccount;
        }
    }
}