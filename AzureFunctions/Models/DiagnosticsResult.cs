namespace AzureFunctions.Models
{
    public class DiagnosticsResult
    {
        public bool IsDiagnosingSuccessful { get; set; }
        public DiagnoseErrorResult ErrorResult { get; set; }
        public DiagnoseSuccessResult SuccessResult { get; set; }
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
        public string ErrorMessage { get; set; }

        public string ErrorId { get; set; }

        public string ErrorAction { get; set; }
    }

    public class DiagnoseSuccessResult
    {
        public bool IsTerminating { get; set; }

        public bool HasUserAction => !string.IsNullOrEmpty(ActionId);

        public string Message { get; set; }

        public string ActionId { get; set; }

        public string UserAction { get; set; }
    }
}