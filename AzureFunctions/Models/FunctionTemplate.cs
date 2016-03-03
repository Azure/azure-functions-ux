using Newtonsoft.Json;

namespace AzureFunctions.Models
{
    public class FunctionTemplate
    {
        [JsonProperty(PropertyName = "name")]
        public string Name { get; set; }

        [JsonProperty(PropertyName = "id")]
        public string Id { get; set; }

        [JsonProperty(PropertyName = "language")]
        public string Language { get; set; }

        [JsonProperty(PropertyName = "trigger")]
        public string Trigger { get; set; }
    }
}