namespace AzureFunctions.Common
{
    public static class ActionIds
    {
        public static readonly string MissingAzureWebjobsStorageAppSetting = $"/heal_actions/{nameof(MissingAzureWebjobsStorageAppSetting)}";
        public static readonly string MissingAzureWebJobsDashboardAppSetting = $"/heal_actions/{nameof(MissingAzureWebJobsDashboardAppSetting)}";
        public static readonly string MissingFunctionsExtensionVersionAppSetting = $"/heal_actions/{nameof(MissingFunctionsExtensionVersionAppSetting)}";
        public static readonly string MissingAzureFilesConnectionString = $"/heal_actions/{nameof(MissingAzureFilesConnectionString)}";
        public static readonly string MissingAzureFilesContentShare = $"/heal_actions/{nameof(MissingAzureFilesContentShare)}";
        public static readonly string InvalidStorageConnectionString = $"/heal_actions/{nameof(InvalidStorageConnectionString)}";
        public static readonly string StorageAccountDoesNotExist = $"/heal_actions/{nameof(StorageAccountDoesNotExist)}";
        public static readonly string StorageAccountDoesntSupportQueues = $"/heal_actions/{nameof(StorageAccountDoesntSupportQueues)}";
        public static readonly string StorageAccountNullOrEmpty = $"/heal_actions/{nameof(StorageAccountNullOrEmpty)}";
        public static readonly string FunctionAppIsStopped = $"/heal_actions/{nameof(FunctionAppIsStopped)}";
        public static readonly string AppIsMisconfiguredInAzure = $"/heal_actions/{nameof(AppIsMisconfiguredInAzure)}";
        public static readonly string DefaultHostNameNotResolving = $"/heal_actions/{nameof(DefaultHostNameNotResolving)}";
        public static readonly string KeysUnexpectedError = $"/heal_actions/{nameof(KeysUnexpectedError)}";
        public static readonly string ScaledOutStamp = $"/heal_actions/{nameof(ScaledOutStamp)}";
        public static readonly string FunctionRuntimeCrashLoop = $"/heal_actions/{nameof(FunctionRuntimeCrashLoop)}";
        public static readonly string FunctionRuntimeUnknownError = $"/heal_actions/{nameof(FunctionRuntimeUnknownError)}";
        public static readonly string NoDiagnoseFound = $"/heal_actions/{nameof(NoDiagnoseFound)}";
    }
}