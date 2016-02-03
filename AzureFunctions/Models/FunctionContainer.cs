using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace AzureFunctions.Models
{
    public class FunctionContainer
    {
        [JsonProperty(PropertyName = "scm_url")]
        public string ScmUrl { get; set; }

        [JsonProperty(PropertyName = "basic")]
        public string BasicAuth { get; set; }

        [JsonProperty(PropertyName = "bearer")]
        public string Bearer { get; set; }
    }
}