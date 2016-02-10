using AzureFunctions.Code.Extensions;
using AzureFunctions.Common;
using AzureFunctions.Models.ArmModels;
using AzureFunctions.Models.ArmResources;
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

        public async Task<Site> LoadAppSettings(Site site)
        {
            var siteResponse = await _client.PostAsync(ArmUriTemplates.ListSiteAppSettings.Bind(site), NullContent);
            await siteResponse.EnsureSuccessStatusCodeWithFullError();

            var armAppSettings = await siteResponse.Content.ReadAsAsync<ArmWrapper<Dictionary<string, string>>>();
            site.AppSettings = armAppSettings.properties;
            return site;
        }

        public async Task<Site> LoadSiteConfig(Site site)
        {
            var siteResponse = await _client.GetAsync(ArmUriTemplates.Site.Bind(site));
            await siteResponse.EnsureSuccessStatusCodeWithFullError();

            var armSite = await siteResponse.Content.ReadAsAsync<ArmWrapper<ArmWebsite>>();
            site.HostName = $"https://{armSite.properties.enabledHostNames.FirstOrDefault(s => s.IndexOf(".scm.", StringComparison.OrdinalIgnoreCase) == -1)}";
            site.HostName = $"https://{armSite.properties.enabledHostNames.FirstOrDefault(s => s.IndexOf(".scm.", StringComparison.OrdinalIgnoreCase) != -1)}";
            return site;
        }

        public async Task<Site> LoadSitePublishingCredentials(Site site)
        {
            var siteResponse = await _client.PostAsync(ArmUriTemplates.SitePublishingCredentials.Bind(site), NullContent);
            await siteResponse.EnsureSuccessStatusCodeWithFullError();

            var creds = await siteResponse.Content.ReadAsAsync<ArmWrapper<ArmWebsitePublishingCredentials>>();
            site.BasicAuth = $"{creds.properties.publishingUserName}:{creds.properties.publishingPassword}".ToBase64();
            return site;
        }

        public async Task<Site> CreateFunctionsSite(ResourceGroup resourceGroup, string serverFarmId)
        {
            await _client.PostAsync(ArmUriTemplates.WebsitesRegister.Bind(resourceGroup), NullContent);

            var siteName = $"{Constants.FunctionsSitePrefix}{Guid.NewGuid().ToString().Split('-').First()}";
            var site = new Site(resourceGroup.SubscriptionId, resourceGroup.ResourceGroupName, siteName);
            var siteResponse = await _client.PutAsJsonAsync(ArmUriTemplates.Site.Bind(site), new { properties = new { serverFarmId = serverFarmId }, location = resourceGroup.Location });
            var armSite = await siteResponse.EnsureSuccessStatusCodeWithFullError();

            await Load(site);
            await CreateHostJson(site);
            await PublishCustomSiteExtensions(site);
            await UpdateConfig(site, new { properties = new { scmType = "LocalGit" } });
            resourceGroup.FunctionsSite = site;
            return site;
        }

        public async Task<Site> CreateHostJson(Site site)
        {
            var vfsResponse = await Utils
                .Retry(() => _client.PutAsync($"{site.ScmHostName}/api/vfs/site/wwwroot/host.json", new StringContent($"{{ \"id\": \"{Guid.NewGuid().ToString().Replace("-", "")}\"}}")),
                       r => r.EnsureSuccessStatusCode(),
                       r => r != null && r.StatusCode == HttpStatusCode.ServiceUnavailable,
                       5);
            await vfsResponse.EnsureSuccessStatusCodeWithFullError();

            var deleteReq = new HttpRequestMessage(HttpMethod.Delete, $"{site.ScmHostName}/api/vfs/site/wwwroot/hostingstart.html");
            deleteReq.Headers.TryAddWithoutValidation("If-Match", "*");
            vfsResponse = await Utils
                .Retry(() => _client.SendAsync(deleteReq),
                       r => r.EnsureSuccessStatusCode(),
                       r => r != null && r.StatusCode == HttpStatusCode.ServiceUnavailable,
                       5);
            await vfsResponse.EnsureSuccessStatusCodeWithFullError();

            return site;
        }

        public async Task<Site> PublishCustomSiteExtensions(Site site)
        {
            await CreateHostSecretsIfNeeded(site);
            await _client.DeleteAsync($"{site.ScmHostName}/api/processes/-1");

            var pKuduResponse = await Utils
                .Retry(() => _client.PutAsync($"{site.ScmHostName}/api/zip", new StreamContent(File.OpenRead(Path.Combine(_settings.AppDataPath, "Kudu.zip")))),
                   r => r.EnsureSuccessStatusCode(),
                   r => r != null && r.StatusCode == HttpStatusCode.ServiceUnavailable,
                   5);
            await pKuduResponse.EnsureSuccessStatusCodeWithFullError();

            pKuduResponse = await Utils
                .Retry(() => _client.PutAsync($"{site.ScmHostName}/api/zip", new StreamContent(File.OpenRead(Path.Combine(_settings.AppDataPath, "AzureFunctions.zip")))),
                   r => r.EnsureSuccessStatusCode(),
                   r => r != null && r.StatusCode == HttpStatusCode.ServiceUnavailable,
                   5);
            await pKuduResponse.EnsureSuccessStatusCodeWithFullError();

            site.AppSettings[Constants.SiteExtensionsVersion] = await _settings.GetCurrentSiteExtensionVersion();
            await UpdateSiteAppSettings(site);
            return site;
        }

        public async Task<Site> CreateHostSecretsIfNeeded(Site site)
        {
            var kuduResponse = await Utils
                .Retry(() => _client.GetAsync($"{site.ScmHostName}/api/vfs/data/functions/secrets/host.json"),
                        r => { if (r.StatusCode != HttpStatusCode.OK && r.StatusCode != HttpStatusCode.NotFound) r.EnsureSuccessStatusCode(); },
                        r => r != null && (r.StatusCode == HttpStatusCode.ServiceUnavailable || r.StatusCode == HttpStatusCode.BadGateway),
                        5);
            if (kuduResponse.StatusCode == HttpStatusCode.NotFound)
            {
                var secrets = new {
                    masterKey = Utils.GetRandomHexNumber(40),
                    functionKey = Utils.GetRandomHexNumber(40)
                };
                var vfsResponse = await Utils
                .Retry(() => _client.PutAsJsonAsync($"{site.ScmHostName}/api/vfs/data/functions/secrets/host.json", secrets),
                       r => r.EnsureSuccessStatusCode(),
                       r => r != null && (r.StatusCode == HttpStatusCode.ServiceUnavailable || r.StatusCode == HttpStatusCode.BadGateway),
                       5);
                await vfsResponse.EnsureSuccessStatusCodeWithFullError();
            }
            return site;
        }

        public async Task<Site> UpdateSiteAppSettings(Site site)
        {
            var armResponse = await _client.PutAsJsonAsync(ArmUriTemplates.PutSiteAppSettings.Bind(site), new { properties = site.AppSettings });
            await armResponse.EnsureSuccessStatusCodeWithFullError();
            return site;
        }

        public async Task<Site> UpdateConfig(Site site, object config)
        {
            var response = await _client.PutAsJsonAsync(ArmUriTemplates.SiteConfig.Bind(site), config);
            await response.EnsureSuccessStatusCodeWithFullError();
            return site;
        }
    }
}