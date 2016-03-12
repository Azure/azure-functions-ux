using Newtonsoft.Json;

namespace AzureFunctions.Models
{
    public class AzureFunctionsServerError
    {
        [JsonProperty(PropertyName = "message")]
        public string Message { get; set; }

        public AzureFunctionsServerError(string message)
        {
            this.Message = message;
        }
    }
}