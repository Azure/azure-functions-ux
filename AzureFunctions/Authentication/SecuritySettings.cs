using System;

namespace AzureFunctions.Authentication
{
    public static class SecuritySettings
    {
        public static string AADClientId
        {
            get { return Environment.GetEnvironmentVariable("AADClientId"); }
        }

        public static string AADClientSecret
        {
            get { return Environment.GetEnvironmentVariable("AADClientSecret"); }
        }
    }
}