using Newtonsoft.Json;

namespace AzureFunctions.Models
{
    public class ClientConfiguration
    {
        [JsonProperty(PropertyName = "RuntimeType")]
        public string RuntimeType { get; set; }

        [JsonProperty(PropertyName = "AzureResourceManagerEndpoint")]
        public string AzureResourceManagerEndpoint { get; set; }
    }
}