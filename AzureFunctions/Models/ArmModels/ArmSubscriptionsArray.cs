using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace AzureFunctions.Models.ArmModels
{
    public class ArmSubscriptionsArray
    {
        public IEnumerable<ArmSubscription> value { get; set; }
    }
}