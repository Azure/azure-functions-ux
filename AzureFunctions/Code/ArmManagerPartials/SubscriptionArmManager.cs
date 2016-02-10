using AzureFunctions.Models.ArmResources;
using AzureFunctions.Code;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using AzureFunctions.Contracts;
using AzureFunctions.Code.Extensions;
using AzureFunctions.Modules;
using System.Net.Http;
using AzureFunctions.Models.ArmModels;
using AzureFunctions.Common;

namespace AzureFunctions.Code
{
    public partial class ArmManager
    {

        public async Task<IEnumerable<Subscription>> GetSubscriptions()
        {
            var subscriptionsResponse = await _client.GetAsync(ArmUriTemplates.Subscriptions.Bind(string.Empty));
            await subscriptionsResponse.EnsureSuccessStatusCodeWithFullError();

            var subscriptions = await subscriptionsResponse.Content.ReadAsAsync<ArmSubscriptionsArray>();
            return subscriptions.value.Select(s => new Subscription(s.subscriptionId, s.displayName));
        }

        public async Task<Subscription> Load(Subscription subscription)
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