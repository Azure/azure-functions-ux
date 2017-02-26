using Newtonsoft.Json;

namespace AzureFunctions.Models
{
    public class ClientConfiguration
    {
        [JsonProperty(PropertyName = "AzureResourceManagerEndpoint")]
        public string AzureResourceManagerEndpoint { get; set; }
    }
}