using AzureFunctions.Code.Extensions;
using AzureFunctions.Models.ArmModels;
using AzureFunctions.Models.ArmResources;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
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

        public async Task<Site> CreateFunctionsSite(ResourceGroup resourceGroup)
        {
            await _client.PostAsync(ArmUriTemplates.WebsitesRegister.Bind(resourceGroup), NullContent);

            var siteName = $"Functions{Guid.NewGuid().ToString().Split('-').First()}";
            var site = new Site(resourceGroup.SubscriptionId, resourceGroup.ResourceGroupName, siteName);
            var siteResponse = await _client.PutAsJsonAsync(ArmUriTemplates.Site.Bind(site), new { properties = new { }, location = resourceGroup.Location });
            var armSite = await siteResponse.EnsureSuccessStatusCodeWithFullError();

            //await Load(site); not really needed but visit again maybe
            await CreateHostJson(site);
            await PublishCustomSiteExtensions(site);
            resourceGroup.FunctionsSite = site;
            return site;
        }

        public async Task<Site> CreateHostJson(Site site)
        {
            var scmUrl = $"https://{site.SiteName}.scm.azurewebsites.net"; // work-aroun
            var vfsResponse = await _client.PutAsync($"{scmUrl}/api/vfs/site/wwwroot/host.json", new StringContent($"{{ \"id\": \"{Guid.NewGuid().ToString().Replace("-", "")}\"}}"));
            await vfsResponse.EnsureSuccessStatusCodeWithFullError();
            var deleteReq = new HttpRequestMessage(HttpMethod.Delete, $"{scmUrl}/api/vfs/site/wwwroot/hostingstart.html");
            deleteReq.Headers.TryAddWithoutValidation("If-Match", "*");
            vfsResponse = await _client.SendAsync(deleteReq);
            await vfsResponse.EnsureSuccessStatusCodeWithFullError();
            return site;
        }

        public async Task<Site> PublishCustomSiteExtensions(Site site)
        {
            var scmUrl = $"https://{site.SiteName}.scm.azurewebsites.net"; // work-aroun
            using (var kuduStream = File.OpenRead(Path.Combine(_settings.AppDataPath, "Kudu.zip")))
            using (var sdkStream = File.OpenRead(Path.Combine(_settings.AppDataPath, "AzureFunctions.zip")))
            {
                await _client.DeleteAsync($"{scmUrl}/api/processes/-1");

                var pKuduResponse = await _client.PutAsync($"{scmUrl}/api/zip", new StreamContent(kuduStream));
                await pKuduResponse.EnsureSuccessStatusCodeWithFullError();
                pKuduResponse = await _client.PutAsync($"{scmUrl}/api/zip", new StreamContent(sdkStream));
                await pKuduResponse.EnsureSuccessStatusCodeWithFullError();
                await _client.DeleteAsync($"{scmUrl}/api/processes/0");
                await _client.DeleteAsync($"{scmUrl}/api/processes/-1");
                return site;
            }
        }

        public async Task<Site> UpdateSiteAppSettings(Site site)
        {
            var armResponse = await _client.PutAsJsonAsync(ArmUriTemplates.PutSiteAppSettings.Bind(site), new { properties = site.AppSettings });
            await armResponse.EnsureSuccessStatusCodeWithFullError();
            return site;
        }
    }
}