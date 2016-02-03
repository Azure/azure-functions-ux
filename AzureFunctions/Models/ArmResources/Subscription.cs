using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace AzureFunctions.Models.ArmResources
{
    public class Subscription
    {
        public string SubscriptionId { get; private set; }
        public ResourceGroup FunctionsResourceGroup { get; set; }
        public string DisplayName { get; private set; }

        public Subscription(string subscriptionId, string displayName)
        {
            this.SubscriptionId = subscriptionId;
            this.DisplayName = displayName;
        }
    }
}