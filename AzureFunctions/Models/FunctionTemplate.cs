using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;

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

        [JsonProperty(PropertyName = "files")]
        public Dictionary<string, string> Files { get; set; }

        [JsonProperty(PropertyName = "runtime")]
        public string Runtime { get; set; }
    }
}