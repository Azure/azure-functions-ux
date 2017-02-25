using System.Collections.Generic;
using Newtonsoft.Json;

namespace AzureFunctions.Models
{
    public class ArmResource<T>
    {
        [JsonProperty("id")]
        public string Id { get; set; }

        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("location")]
        public string Location { get; set; }

        [JsonProperty("kind")]
        public string Kind { get; set; }

        [JsonProperty("type")]
        public string Type { get; set; }

        [JsonProperty("tags")]
        public IDictionary<string, string> Tags { get; set; }

        [JsonProperty("properties")]
        public T Properties { get; set; }
    }
}