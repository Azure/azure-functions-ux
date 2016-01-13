using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace AzureFunctions.Models
{
    public class PassthroughInfo
    {
        [JsonProperty(PropertyName = "httpMethod")]
        public string HttpMethod { get; set; }

        [JsonProperty(PropertyName = "requestBody")]
        public JObject RequestBody { get; set; }

        [JsonProperty(PropertyName = "url")]
        public string Url { get; set; }

        [JsonProperty(PropertyName = "queryString")]
        public string QueryString { get; set; }
    }
}