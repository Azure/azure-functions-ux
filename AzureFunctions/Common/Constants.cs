using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace AzureFunctions.Common
{
    public static class Constants
    {
        public const string SubscriptionTemplate = "{0}/subscriptions/{1}?api-version={2}";
        public const string CSMApiVersion = "2014-04-01";
        public const string CSMUrl = "https://management.azure.com";
        public const string X_MS_OAUTH_TOKEN = "X-MS-OAUTH-TOKEN";
        public const string ApplicationJson = "application/json";
        public const string AzureStorageAppSettingsName = "AzureWebJobsStorage";
        public const string AzureStorageDashboardAppSettingsName = "AzureWebJobsDashboard";
        public const string StorageConnectionStringTemplate = "DefaultEndpointsProtocol=https;AccountName={0};AccountKey={1}";
        public const string SiteExtensionsVersion = "SiteExtensionsVersion";
        public const string PublishingUserName = "publishingUserName";
        public const string PublishingPassword = "publishingPassword";
    }
}