using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace AzureFunctions.Models
{
    public class CreateFunctionInfoV3
    {
           [JsonProperty(PropertyName = "files")]
            public Dictionary<string, string> files { get; set; }

            [JsonProperty(PropertyName = "name")]
            public string Name { get; set; }

            [JsonProperty(PropertyName = "containerScmUrl")]
            public string ContainerScmUrl { get; set; }

            [JsonProperty(PropertyName = "config")]
            public JObject Config { get; set; }
    }
}