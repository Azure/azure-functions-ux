using System.Collections.Generic;
using Newtonsoft.Json;

namespace AzureFunctions.Models
{
    public class RequestObject
    {
        [JsonProperty("method")]
        public string Method { get; set; }

        [JsonProperty("url")]
        public string Url { get; set; }

        [JsonProperty("body")]
        public string Body { get; set; }

        [JsonProperty("headers")]
        public Dictionary<string, string> Headers { get; set; }
    }
}