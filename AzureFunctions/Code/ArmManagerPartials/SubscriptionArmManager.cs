using AzureFunctions.Models.ArmResources;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AzureFunctions.Code.Extensions;
using System.Net.Http;
using AzureFunctions.Models.ArmModels;
using AzureFunctions.Common;
using AzureFunctions.Trace;

namespace AzureFunctions.Code
{
    public partial class ArmManager
    {

        public Task<IEnumerable<Subscription>> ListSubscriptionsAsync()
        {
            
        }

        public async Task<Subscription> Load(Subscription subscription)
        {
            using (FunctionsTrace.BeginTimedOperation(nameof(subscription)))
            {
                var armResourceGroupsResponse = await _client.GetAsync(ArmUriTemplates.ResourceGroups.Bind(subscription));
                await armResourceGroupsResponse.EnsureSuccessStatusCodeWithFullError();

                var armResourceGroups = await armResourceGroupsResponse.Content.ReadAsAsync<ArmArrayWrapper<ArmResourceGroup>>();

                subscription.FunctionsResourceGroup = armResourceGroups.value
                    .Where(rg => rg.name.Equals(Constants.FunctionsResourceGroupName, StringComparison.OrdinalIgnoreCase) ||
                                 rg.name.StartsWith(Constants.TryAppServiceResourceGroupPrefix, StringComparison.OrdinalIgnoreCase))
                    .Select(rg => new ResourceGroup(subscription.SubscriptionId, rg.name, rg.location) { Tags = rg.tags })
                    .FirstOrDefault();

                return subscription;
            }
        }
    }
}