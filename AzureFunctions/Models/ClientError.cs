using Newtonsoft.Json;

namespace AzureFunctions.Models
{
    public class ClientError
    {
        [JsonProperty(PropertyName = "message")]
        public string Message { get; set; }

        [JsonProperty(PropertyName = "stackTrace")]
        public string StackTrace { get; set; }
    }
}