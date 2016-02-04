using AzureFunctions.Code.Extensions;
using AzureFunctions.Common;
using AzureFunctions.Models;
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
        public async Task<IEnumerable<ServerFarm>> GetServerFarms()
        {
            var subscriptions = await GetSubscriptions();
            var temp = await subscriptions
                .Select(GetServerFarms)
                .WhenAll();
            return temp.SelectMany(i => i);
        }

        public async Task<IEnumerable<ServerFarm>> GetServerFarms(Subscription subscription)
        {
            var serverFarmsResponse = await _client.GetAsync(ArmUriTemplates.SubscriptionLevelServerFarms.Bind(subscription));
            await serverFarmsResponse.EnsureSuccessStatusCodeWithFullError();
            var serverFarms = await serverFarmsResponse.Content.ReadAsAsync<ArmArrayWrapper<ArmServerFarm>>();
            return serverFarms.value
                .Select(sf => new ServerFarm(subscription.SubscriptionId, sf.properties.resourceGroup, sf.name));
        }
    }
}