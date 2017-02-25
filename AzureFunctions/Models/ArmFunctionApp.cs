using System.Collections.Generic;
using Newtonsoft.Json;

namespace AzureFunctions.Models
{
    public class ArmFunctionApp
    {
        [JsonProperty("sku")]
        public string Sku { get; set; }

        [JsonProperty("state")]
        public string State { get; set; }

        [JsonProperty("enabled")]
        public bool Enabled { get; set; }

        [JsonProperty("adminEnabled")]
        public bool AdminEnabled { get; set; }

        [JsonProperty("siteDisabledReason")]
        public int SiteDisabledReason { get; set; }

        [JsonProperty("homeStamp")]
        public string HomeStamp { get; set; }

        [JsonProperty("suspendedTill")]
        public string SuspendedTill { get; set; }

        [JsonProperty("clientCertEnabled")]
        public bool ClientCertEnabled { get; set; }

        [JsonProperty("defaultHostName")]
        public string DefaultHostName { get; set; }

        [JsonProperty("hostNameSslStates")]
        public IEnumerable<HostNameSslState> HostNameSslStates { get; set; }
    }

    public class HostNameSslState
    {
        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("hostType")]
        public int HostType { get; set; }
    }
}