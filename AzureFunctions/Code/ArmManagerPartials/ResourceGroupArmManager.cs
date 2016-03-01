using AzureFunctions.Code.Extensions;
using AzureFunctions.Common;
using AzureFunctions.Models;
using AzureFunctions.Models.ArmModels;
using AzureFunctions.Models.ArmResources;
using AzureFunctions.Trace;
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
        public async Task<ResourceGroup> Load(ResourceGroup resourceGroup)
        {
            using (FunctionsTrace.BeginTimedOperation(nameof(resourceGroup)))
            {
                var armResourceGroupResourcesResponse = await _client.GetAsync(ArmUriTemplates.ResourceGroupResources.Bind(resourceGroup));
                await armResourceGroupResourcesResponse.EnsureSuccessStatusCodeWithFullError();
                var resources = await armResourceGroupResourcesResponse.Content.ReadAsAsync<ArmArrayWrapper<object>>();

                resourceGroup.FunctionsSite = resources.value
                    .Where(r => r.kind.Equals(Constants.FunctionAppArmKind, StringComparison.OrdinalIgnoreCase))
                    .Select(r => new Site(resourceGroup.SubscriptionId, resourceGroup.ResourceGroupName, r.name))
                    .FirstOrDefault();

                resourceGroup.FunctionsStorageAccount = resources.value
                    .Where(r => r.type.Equals(Constants.StorageAccountArmType, StringComparison.OrdinalIgnoreCase) &&
                                (r.name.StartsWith(Constants.FunctionsStorageAccountNamePrefix, StringComparison.OrdinalIgnoreCase) ||
                                r.name.StartsWith("functions", StringComparison.OrdinalIgnoreCase)))
                    .Select(r => new StorageAccount(resourceGroup.SubscriptionId, resourceGroup.ResourceGroupName, r.name))
                    .FirstOrDefault();

                return resourceGroup;
            }
        }

        public async Task<ResourceGroup> CreateResourceGroup(string subscriptionId, string location)
        {
            using (var perf = FunctionsTrace.BeginTimedOperation($"{nameof(subscriptionId)}, {nameof(location)}"))
            {
                var resourceGroup = new ResourceGroup(subscriptionId, Constants.FunctionsResourceGroupName, location);
                var resourceGroupResponse = await _client.PutAsJsonAsync(ArmUriTemplates.ResourceGroup.Bind(resourceGroup), new { properties = new { }, location = location });
                await resourceGroupResponse.EnsureSuccessStatusCodeWithFullError();

                return resourceGroup;
            }
        }
    }
}