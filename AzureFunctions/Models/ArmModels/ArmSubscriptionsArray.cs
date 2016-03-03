using System.Collections.Generic;

namespace AzureFunctions.Models.ArmModels
{
    public class ArmSubscriptionsArray
    {
        public IEnumerable<ArmSubscription> value { get; set; }
    }
}