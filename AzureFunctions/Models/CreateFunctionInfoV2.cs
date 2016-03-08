using Newtonsoft.Json;
using System.Collections.Generic;

namespace AzureFunctions.Models
{
    public class CreateFunctionInfoV2
    {
        [JsonProperty(PropertyName = "files")]
        public Dictionary<string, string> files { get; set; }

        [JsonProperty(PropertyName = "name")]
        public string Name { get; set; }

        [JsonProperty(PropertyName = "containerScmUrl")]
        public string ContainerScmUrl { get; set; }
    }
}