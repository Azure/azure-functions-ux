using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Web;

namespace AzureFunctions.Models.ArmResources
{
    public class ServerFarm : BaseResource
    {
        private string _csmIdTemplate = "/subscriptions/{0}/resourceGroups/{1}/providers/Microsoft.Web/serverFarms/{2}";

        [JsonProperty(PropertyName = "serverFarmName")]
        public string ServerFarmName { get; private set; }

        [JsonProperty(PropertyName = "geoRegion")]
        public string GeoRegion { get; set; }

        [JsonProperty(PropertyName = "armId")]
        public override string ArmId
        {
            get
            {
                return string.Format(CultureInfo.InvariantCulture, this._csmIdTemplate, this.SubscriptionId, this.ResourceGroupName, this.ServerFarmName);
            }
        }

        public ServerFarm(string subscriptionId, string resoruceGroupName, string serverFarmName)
            : base(subscriptionId, resoruceGroupName)
        {
            this.ServerFarmName = serverFarmName;
        }
    }
}