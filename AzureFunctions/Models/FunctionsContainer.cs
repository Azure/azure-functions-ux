using Newtonsoft.Json;
using System.Collections.Generic;

namespace AzureFunctions.Models
{
    public class FunctionsContainer
    {
        [JsonProperty(PropertyName = "scm_url")]
        public string ScmUrl { get; set; }

        [JsonProperty(PropertyName = "basic")]
        public string BasicAuth { get; set; }

        [JsonProperty(PropertyName = "bearer")]
        public string Bearer { get; set; }

        [JsonProperty(PropertyName = "armId")]
        public string ArmId { get; set; }

        [JsonProperty(PropertyName = "appSettings")]
        public Dictionary<string, string> AppSettings { get; set; }

    }
}