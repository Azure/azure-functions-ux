using Newtonsoft.Json;

namespace AzureFunctions.Models
{
    public class DiagnosticsResult
    {
        [JsonProperty("isDiagnosingSuccessful")]
        public bool IsDiagnosingSuccessful { get; set; }

        [JsonProperty("errorResult")]
        public DiagnoseErrorResult ErrorResult { get; set; }

        [JsonProperty("successResult")]
        public DiagnoseSuccessResult SuccessResult { get; set; }

        [JsonProperty("code")]
        public string Code { get; set; }

        public DiagnosticsResult()
        {
            ErrorResult = new DiagnoseErrorResult();
            SuccessResult = new DiagnoseSuccessResult();
            Code = string.Empty;
        }
    }

    public class DiagnoseErrorResult
    {
        [JsonProperty("errorMessage")]
        public string ErrorMessage { get; set; }

        [JsonProperty("errorId")]
        public string ErrorId { get; set; }

        [JsonProperty("errorAction")]
        public string ErrorAction { get; set; }
    }

    public class DiagnoseSuccessResult
    {
        [JsonProperty("isTerminating")]
        public bool IsTerminating { get; set; }

        [JsonProperty("hasUserAction")]
        public bool HasUserAction => !string.IsNullOrEmpty(UserAction);

        [JsonProperty("message")]
        public string Message { get; set; }

        [JsonProperty("actionId")]
        public string ActionId { get; set; }

        [JsonProperty("userAction")]
        public string UserAction { get; set; }
    }
}