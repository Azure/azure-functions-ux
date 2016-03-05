using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace AzureFunctions.Models
{
    public class FunctionTemplate
    {
        [JsonProperty(PropertyName = "id")]
        public string Id { get; set; }

        [JsonProperty(PropertyName = "function")]
        public JObject Function { get; set; }

        [JsonProperty(PropertyName = "metadata")]
        public JObject Metadata { get; set; }

    }
}