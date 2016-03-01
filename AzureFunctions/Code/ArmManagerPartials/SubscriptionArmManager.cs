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

        public async Task<IEnumerable<Subscription>> GetSubscriptions()
        {
            using (FunctionsTrace.BeginTimedOperation())
            {
                var subscriptionsResponse = await _client.GetAsync(ArmUriTemplates.Subscriptions.Bind(string.Empty));
                await subscriptionsResponse.EnsureSuccessStatusCodeWithFullError();

                var subscriptions = await subscriptionsResponse.Content.ReadAsAsync<ArmSubscriptionsArray>();
                return subscriptions.value.Select(s => new Subscription(s.subscriptionId, s.displayName));
            }
        }

        public async Task<Subscription> Load(Subscription subscription)
        {
            using (FunctionsTrace.BeginTimedOperation(nameof(subscription)))
            {
                var armResourcesResponse = await _client.GetAsync(ArmUriTemplates.Resources.Bind(subscription));
                await armResourcesResponse.EnsureSuccessStatusCodeWithFullError();

                var armResources = await armResourcesResponse.Content.ReadAsAsync<ArmArrayWrapper<object>>();

                subscription.FunctionsResourceGroup = armResources.value
                    .Where(rg => rg.kind.Equals(Constants.FunctionAppArmKind, StringComparison.OrdinalIgnoreCase))
                    .Select(rg => new ResourceGroup(subscription.SubscriptionId, rg.name, rg.location) { Tags = rg.tags })
                    .FirstOrDefault();

                return subscription;
            }
        }
    }
}