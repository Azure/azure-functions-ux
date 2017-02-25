using System.Collections.Generic;
using Newtonsoft.Json;

namespace AzureFunctions.Models
{
    public class HostStatus
    {
        [JsonProperty("id")]
        public string Id { get; set; }

        [JsonProperty("version")]
        public string Version { get; set; }

        [JsonProperty("errors")]
        public IEnumerable<string> Errors { get; set; }
    }
}