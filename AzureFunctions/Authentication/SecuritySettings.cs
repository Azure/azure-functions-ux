using System;
using System.Configuration;

namespace AzureFunctions.Authentication
{
    public static class SecuritySettings
    {
        public static string AADClientId
        {
            get
            {
                return Environment.GetEnvironmentVariable("AADClientId") ?? ConfigurationManager.AppSettings["SecuritySettings.AADClientId"];
            }
        }

        public static string AADClientSecret
        {
            get
            {
                return Environment.GetEnvironmentVariable("AADClientSecret") ?? ConfigurationManager.AppSettings["SecuritySettings.AADClientSecret"];
            }
        }
    }
}