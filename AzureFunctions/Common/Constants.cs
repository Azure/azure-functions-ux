namespace AzureFunctions.Common
{
    public static class Constants
    {
        public const string SubscriptionTemplate = "{0}/subscriptions/{1}?api-version={2}";
        public const string CSMApiVersion = "2014-04-01";
        public const string CSMUrl = "https://management.azure.com";
        public const string X_MS_OAUTH_TOKEN = "X-MS-OAUTH-TOKEN";
        public const string PortalTokenHeader = "portal-token";
        public const string ApplicationJson = "application/json";
        public const string UserAgent = "Functions/1.0";
        public const string TryAppServiceResourceGroupPrefix = "TRY_RG_";
        public const string TryAppServiceTenantId = "6224bcc1-1690-4d04-b905-92265f948dad";
        public const string TryAppServiceCreateUrl = "https://tryappservice.azure.com/api/resource?x-ms-routing-name=next";
        public const string MetadataJson = "metadata.json";
        public const string FrontEndDisplayNameHeader = "X-MS-CLIENT-DISPLAY-NAME";
        public const string FrontEndPrincipalNameHeader = "X-MS-CLIENT-PRINCIPAL-NAME";
        public const string AnonymousUserName = "Anonymous";
        public const string PortalReferrer = "https://portal.azure.com/";
        public const string MsPortalReferrer = "https://ms.portal.azure.com/";
        public const string RcPortalReferrer = "https://rc.portal.azure.com/";
        public const string PortalAnonymousUser = "Portal/1.0.0";
    }
}