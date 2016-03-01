using AzureFunctions.Code.Extensions;
using AzureFunctions.Common;
using AzureFunctions.Models.ArmModels;
using AzureFunctions.Models.ArmResources;
using AzureFunctions.Trace;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;

namespace AzureFunctions.Code
{
    public partial class ArmManager
    {
        public async Task<Site> Load(Site site)
        {
            using (FunctionsTrace.BeginTimedOperation(nameof(site)))
            {
                await new[]
                {
                    LoadAppSettings(site),
                    LoadSiteConfig(site),
                    LoadSitePublishingCredentials(site)
                }
                //.IgnoreFailures()
                .WhenAll();
                return site;
            }
        }

        public async Task<Site> LoadAppSettings(Site site)
        {
            using (FunctionsTrace.BeginTimedOperation())
            {
                var siteResponse = await _client.PostAsync(ArmUriTemplates.ListSiteAppSettings.Bind(site), NullContent);
                await siteResponse.EnsureSuccessStatusCodeWithFullError();

                var armAppSettings = await siteResponse.Content.ReadAsAsync<ArmWrapper<Dictionary<string, string>>>();
                site.AppSettings = armAppSettings.properties;
                return site;
            }
        }

        public async Task<Site> LoadSiteConfig(Site site)
        {
            using (FunctionsTrace.BeginTimedOperation())
            {
                var siteResponse = await _client.GetAsync(ArmUriTemplates.Site.Bind(site));
                await siteResponse.EnsureSuccessStatusCodeWithFullError();

                var armSite = await siteResponse.Content.ReadAsAsync<ArmWrapper<ArmWebsite>>();
                site.HostName = $"https://{armSite.properties.enabledHostNames.FirstOrDefault(s => s.IndexOf(".scm.", StringComparison.OrdinalIgnoreCase) == -1)}";
                site.HostName = $"https://{armSite.properties.enabledHostNames.FirstOrDefault(s => s.IndexOf(".scm.", StringComparison.OrdinalIgnoreCase) != -1)}";
                return site;
            }
        }

        public async Task<Site> LoadSitePublishingCredentials(Site site)
        {
            using (FunctionsTrace.BeginTimedOperation())
            {
                var siteResponse = await _client.PostAsync(ArmUriTemplates.SitePublishingCredentials.Bind(site), NullContent);
                await siteResponse.EnsureSuccessStatusCodeWithFullError();

                var creds = await siteResponse.Content.ReadAsAsync<ArmWrapper<ArmWebsitePublishingCredentials>>();
                site.BasicAuth = $"{creds.properties.publishingUserName}:{creds.properties.publishingPassword}".ToBase64();
                return site;
            }
        }

        public async Task<Site> CreateFunctionsSite(ResourceGroup resourceGroup, string serverFarmId)
        {
            if (resourceGroup.FunctionsStorageAccount == null)
            {
                throw new InvalidOperationException("storage account can't be null");
            }

            using (FunctionsTrace.BeginTimedOperation())
            {
                var storageAccount = resourceGroup.FunctionsStorageAccount;
                await _client.PostAsync(ArmUriTemplates.WebsitesRegister.Bind(resourceGroup), NullContent);

                var siteName = $"{Constants.FunctionsSitePrefix}{Guid.NewGuid().ToString().Split('-').First()}";
                var site = new Site(resourceGroup.SubscriptionId, resourceGroup.ResourceGroupName, siteName);
                var siteObject = new
                {
                    properties = new
                    {
                        serverFarmId = serverFarmId,
                        siteConfig = new
                        {
                            appSettings = new[]
                            {
                                new { name = Constants.AzureStorageAppSettingsName, value = storageAccount.GetConnectionString() },
                                new { name = Constants.AzureStorageDashboardAppSettingsName, value = storageAccount.GetConnectionString() },
                                new { name = Constants.FunctionsExtensionVersion, value = Constants.Latest }
                            },
                            scmType = "LocalGit"
                        }
                    },
                    location = resourceGroup.Location,
                    kind = Constants.FunctionAppArmKind
                };
                var siteResponse = await _client.PutAsJsonAsync(ArmUriTemplates.Site.Bind(site), siteObject);
                var armSite = await siteResponse.EnsureSuccessStatusCodeWithFullError();

                await Load(site);
                resourceGroup.FunctionsSite = site;
                return site;
            }
        }

        public async Task<Site> UpdateSiteAppSettings(Site site)
        {
            using (FunctionsTrace.BeginTimedOperation())
            {
                var armResponse = await _client.PutAsJsonAsync(ArmUriTemplates.PutSiteAppSettings.Bind(site), new { properties = site.AppSettings });
                await armResponse.EnsureSuccessStatusCodeWithFullError();
                return site;
            }
        }

        public async Task<Site> UpdateConfig(Site site, object config)
        {
            using (FunctionsTrace.BeginTimedOperation())
            {
                var response = await _client.PutAsJsonAsync(ArmUriTemplates.SiteConfig.Bind(site), config);
                await response.EnsureSuccessStatusCodeWithFullError();
                return site;
            }
        }
    }
}