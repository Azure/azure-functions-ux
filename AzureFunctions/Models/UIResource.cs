using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace AzureFunctions.Models
{
    public class UIResource
    {
        [JsonProperty(PropertyName = "url", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Url { get; set; }

        [JsonProperty(PropertyName = "mobileWebClient", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string MobileWebClient { get; set; }

        [JsonProperty(PropertyName = "ibizaUrl", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string IbizaUrl { get; set; }

        [JsonProperty(PropertyName = "monacoUrl", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string MonacoUrl { get; set; }

        [JsonProperty(PropertyName = "contentDownloadUrl", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string ContentDownloadUrl { get; set; }

        [JsonProperty(PropertyName = "gitUrl", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string GitUrl { get; set; }

        [JsonProperty(PropertyName = "timeLeft", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public int TimeLeftInSeconds { get; set; }

        [JsonConverter(typeof(StringEnumConverter))]
        public AppService AppService { get; set; }

        public bool IsRbacEnabled { get; set; }

        [JsonProperty(PropertyName = "templateName")]
        public string TemplateName { get; set; }

        [JsonProperty(PropertyName = "isExtended")]
        public bool IsExtended { get; set; }

        [JsonProperty(PropertyName = "csmId")]
        public string csmId{ get; set; }
    }
}