using Newtonsoft.Json;

namespace AzureFunctions.Models
{
    public class MasterKey
    {
        [JsonProperty("masterKey")]
        public string Key { get; set; }
    }
}