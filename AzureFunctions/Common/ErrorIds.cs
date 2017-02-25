namespace AzureFunctions.Common
{
    public static class ErrorIds
    {
        public static readonly string CannotAccessFunctionAppArmResource = $"/errors/back_end/{nameof(CannotAccessFunctionAppArmResource)}";

        public static string UnexpectedArmError { get; internal set; }
        public static string UnknownErrorCallingArm { get; internal set; }
        //public static readonly string 
    }
}