using AzureFunctions.Code;
using AzureFunctions.Common;
using AzureFunctions.Contracts;
using AzureFunctions.Models;
using AzureFunctions.Models.ArmModels;
using AzureFunctions.Modules;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Hosting;
using System.Web.Http;

namespace AzureFunctions.Controllers
{
    public class AzureFunctionsController : ApiController
    {
        private IArmManager _armManager;

        public AzureFunctionsController(IArmManager armManager)
        {
            this._armManager = armManager;
        }

        [Authorize]
        [HttpPost]
        public async Task<HttpResponseMessage> InitializeUser()
        {
            using (var client = GetClient())
            {
                var updateAppSettings = false;
                // Get first sub
                var subscriptionsResponse = await client.GetAsync(ArmUriTemplates.Subscriptions.Bind(string.Empty));
                await subscriptionsResponse.EnsureSuccessStatusCodeWithFullError();
                var subscriptions = await subscriptionsResponse.Content.ReadAsAsync<ArmSubscriptionsArray>();
                var subscription = subscriptions.value.FirstOrDefault(s => s.displayName.IndexOf("msdn") != -1) ?? subscriptions.value.FirstOrDefault();

                // look for a rg that starts with AzureFunctionsResourceGroup
                var resourceGroupsResponse = await client.GetAsync(ArmUriTemplates.ResourceGroups.Bind(new { subscriptionId = subscription.subscriptionId }));
                await resourceGroupsResponse.EnsureSuccessStatusCodeWithFullError();
                var resourceGroups = await resourceGroupsResponse.Content.ReadAsAsync<ArmArrayWrapper<ArmResourceGroup>>();
                var resourceGroup = resourceGroups.value.FirstOrDefault(rg => rg.name.Equals("AzureFunctions", StringComparison.OrdinalIgnoreCase));
                if (resourceGroup == null)
                {
                    //create it
                    var createRGResponse = await client.PutAsJsonAsync(ArmUriTemplates.ResourceGroup.Bind(new { subscriptionId = subscription.subscriptionId, resourceGroupName = "AzureFunctions" }), new { properties = new { }, location = "West US" });
                    await createRGResponse.EnsureSuccessStatusCodeWithFullError();
                    resourceGroup = await createRGResponse.Content.ReadAsAsync<ArmWrapper<ArmResourceGroup>>();
                }

                // look for a site that starts with AzureFunctionsContainer{random}
                var sitesResponse = await client.GetAsync(ArmUriTemplates.Sites.Bind(new { subscriptionId = subscription.subscriptionId, resourceGroupName = resourceGroup.name }));
                await sitesResponse.EnsureSuccessStatusCodeWithFullError();
                var sites = await sitesResponse.Content.ReadAsAsync<ArmArrayWrapper<ArmWebsite>>();
                var site = sites.value.FirstOrDefault(s => s.name.StartsWith("Functions", StringComparison.OrdinalIgnoreCase));
                string scmUrl = null;
                if (site == null)
                {
                    //register the provider just in case
                    await client.PostAsync(ArmUriTemplates.WebsitesRegister.Bind(new { subscriptionId = subscription.subscriptionId }), new StringContent(string.Empty));

                    //create website
                    var siteName = $"Functions{Guid.NewGuid().ToString().Split('-').First()}";
                    var createSiteResponse = await client.PutAsJsonAsync(ArmUriTemplates.Site.Bind(new { subscriptionId = subscription.subscriptionId, resourceGroupName = resourceGroup.name, siteName = siteName }), new { properties = new { }, location = resourceGroup.location });
                    await createSiteResponse.EnsureSuccessStatusCodeWithFullError();
                    site = await createSiteResponse.Content.ReadAsAsync<ArmWrapper<ArmWebsite>>();
                    scmUrl = $"https://{site.properties.enabledHostNames.FirstOrDefault(h => h.IndexOf(".scm.", StringComparison.OrdinalIgnoreCase) != -1) }";

                    // publish private kudu
                    await PublishSiteExtensions(client, scmUrl, firstTime: true);
                }
                else
                {
                    scmUrl = $"https://{site.properties.enabledHostNames.FirstOrDefault(h => h.IndexOf(".scm.", StringComparison.OrdinalIgnoreCase) != -1) }";
                }


                sitesResponse = await client.PostAsync(ArmUriTemplates.ListSiteAppSettings.Bind(new { subscriptionId = subscription.subscriptionId, resourceGroupName = resourceGroup.name, siteName = site.name }), new StringContent(string.Empty));
                await sitesResponse.EnsureSuccessStatusCodeWithFullError();
                var appSettings = await sitesResponse.Content.ReadAsAsync<ArmWrapper<Dictionary<string, string>>>();
                if (!appSettings.properties.ContainsKey(Constants.AzureStorageAppSettingsName))
                {
                    // create storage account
                    var storageResponse = await client.GetAsync(ArmUriTemplates.StorageAccounts.Bind(new { subscriptionId = subscription.subscriptionId, resourceGroupName = resourceGroup.name }));
                    await storageResponse.EnsureSuccessStatusCodeWithFullError();
                    var storageAccounts = await storageResponse.Content.ReadAsAsync<ArmArrayWrapper<ArmStorage>>();
                    var storageAccount = storageAccounts.value.FirstOrDefault(s =>
                        s.name.StartsWith("AzureFunctions", StringComparison.OrdinalIgnoreCase) &&
                        s.properties.provisioningState.Equals("Succeeded", StringComparison.OrdinalIgnoreCase));

                    if (storageAccount == null)
                    {
                        var storageAccountName = $"AzureFunctions{Guid.NewGuid().ToString().Split('-').First()}".ToLowerInvariant();
                        await client.PostAsJsonAsync(ArmUriTemplates.StorageRegister.Bind(new { subscriptionId = subscription.subscriptionId }), new { });
                        storageResponse = await client.PutAsJsonAsync(ArmUriTemplates.StorageAccount.Bind(
                            new { subscriptionId = subscription.subscriptionId, resourceGroupName = resourceGroup.name, storageAccountName = storageAccountName }),
                            new { location = "West US", properties = new { accountType = "Standard_GRS" } });
                        await storageResponse.EnsureSuccessStatusCodeWithFullError();
                        var isSucceeded = false;
                        var tries = 10;
                        do {
                            storageResponse = await client.GetAsync(ArmUriTemplates.StorageAccount.Bind(new { subscriptionId = subscription.subscriptionId, resourceGroupName = resourceGroup.name, storageAccountName = storageAccountName }));
                            await storageResponse.EnsureSuccessStatusCodeWithFullError();
                            storageAccount = await storageResponse.Content.ReadAsAsync<ArmWrapper<ArmStorage>>();
                            isSucceeded = storageAccount.properties.provisioningState.Equals("Succeeded", StringComparison.OrdinalIgnoreCase);
                            tries--;
                            if (!isSucceeded) await Task.Delay(500);
                        } while (!isSucceeded && tries > 0);
                    }

                    storageResponse = await client.PostAsync(ArmUriTemplates.StorageListKeys.Bind(new { subscriptionId = subscription.subscriptionId, resourceGroupName = resourceGroup.name, storageAccountName = storageAccount.name }), new StringContent(string.Empty));
                    await storageResponse.EnsureSuccessStatusCodeWithFullError();
                    var key = (await storageResponse.Content.ReadAsAsync<Dictionary<string, string>>())["key1"];
                    appSettings.properties[Constants.AzureStorageAppSettingsName] = string.Format(Constants.StorageConnectionStringTemplate, storageAccount.name, key);
                    appSettings.properties[Constants.AzureStorageDashboardAppSettingsName] = string.Format(Constants.StorageConnectionStringTemplate, storageAccount.name, key);

                    //save it
                    updateAppSettings = true;
                }

                sitesResponse = await client.PostAsync(ArmUriTemplates.SitePublishingCredentials.Bind(new { subscriptionId = subscription.subscriptionId, resourceGroupName = resourceGroup.name, siteName = site.name }), new StringContent(string.Empty));
                await sitesResponse.EnsureSuccessStatusCodeWithFullError();
                var publishingCredentials = await sitesResponse.Content.ReadAsAsync<ArmWrapper<ArmWebsitePublishingCredentials>>();

                using (var rstream = new StreamReader(@"D:\home\site\wwwroot\App_Data\version.txt"))
                {
                    var currentSiteExtensionsVersion = await rstream.ReadToEndAsync();
                    if (!appSettings.properties.ContainsKey(Constants.SiteExtensionsVersion) ||
                        !appSettings.properties[Constants.SiteExtensionsVersion].Equals(currentSiteExtensionsVersion, StringComparison.OrdinalIgnoreCase))
                    {
                        await client.PutAsJsonAsync(ArmUriTemplates.PutSiteAppSettings.Bind(new { subscriptionId = subscription.subscriptionId, resourceGroupName = resourceGroup.name, siteName = site.name }), new { properties = appSettings.properties });
                        await PublishSiteExtensions(client, scmUrl, firstTime: false);
                        appSettings.properties[Constants.SiteExtensionsVersion] = currentSiteExtensionsVersion;
                        updateAppSettings = true;
                    }
                }

                if (updateAppSettings)
                {
                    sitesResponse = await client.PutAsJsonAsync(ArmUriTemplates.PutSiteAppSettings.Bind(new { subscriptionId = subscription.subscriptionId, resourceGroupName = resourceGroup.name, siteName = site.name }), new { properties = appSettings.properties });
                    await sitesResponse.EnsureSuccessStatusCodeWithFullError();
                }

                // return it's scm name
                return Request.CreateResponse(HttpStatusCode.OK, new { scm_url = scmUrl, bearer = GetToken(), basic = $"{publishingCredentials.properties.publishingUserName}:{publishingCredentials.properties.publishingPassword}".ToBase64() });
            }
        }

        [HttpGet]
        public HttpResponseMessage GetValues()
        {
            return Request.CreateResponse(HttpStatusCode.OK, new { hello = "hi" });
        }

        private async Task PublishSiteExtensions(HttpClient client, string scmUrl, bool firstTime)
        {
            using (var kuduStream = File.OpenRead(@"D:\home\site\wwwroot\App_Data\Kudu.zip"))
            using (var sdkStream = File.OpenRead(@"D:\home\site\wwwroot\App_Data\AzureFunctions.zip"))
            {
                if (firstTime)
                {
                    var vfsResponse = await client.PutAsync($"{scmUrl}/api/vfs/site/wwwroot/host.json", new StringContent($"{{ \"id\": \"{Guid.NewGuid().ToString().Replace("-", "")}\"}}"));
                    await vfsResponse.EnsureSuccessStatusCodeWithFullError();
                    var deleteReq = new HttpRequestMessage(HttpMethod.Delete, $"{scmUrl}/api/vfs/site/wwwroot/hostingstart.html");
                    deleteReq.Headers.TryAddWithoutValidation("If-Match", "*");
                    vfsResponse = await client.SendAsync(deleteReq);
                    await vfsResponse.EnsureSuccessStatusCodeWithFullError();
                }
                else
                {
                    await client.DeleteAsync($"{scmUrl}/api/processes/-1");
                }
                var pKuduResponse = await client.PutAsync($"{scmUrl}/api/zip", new StreamContent(kuduStream));
                await pKuduResponse.EnsureSuccessStatusCodeWithFullError();
                pKuduResponse = await client.PutAsync($"{scmUrl}/api/zip", new StreamContent(sdkStream));
                await pKuduResponse.EnsureSuccessStatusCodeWithFullError();
                await client.DeleteAsync($"{scmUrl}/api/processes/0");
                await client.DeleteAsync($"{scmUrl}/api/processes/-1");
                //pKuduResponse.EnsureSuccessStatusCode();
            }
        }

        [Authorize]
        [HttpPost]
        public async Task<HttpResponseMessage> Passthrough(PassthroughInfo passthroughInfo)
        {
            using (var client = GetClient())
            {
                var request = new HttpRequestMessage(
                    new HttpMethod(passthroughInfo.HttpMethod), passthroughInfo.Url + (string.IsNullOrEmpty(passthroughInfo.QueryString) ? string.Empty : $"?{passthroughInfo.QueryString}"));

                if (passthroughInfo.RequestBody != null)
                {
                    request.Content = new StringContent(passthroughInfo.RequestBody.ToString(), Encoding.UTF8, passthroughInfo.MediaType ?? Constants.ApplicationJson);
                }

                if (passthroughInfo.Headers != null)
                {
                    foreach (var pair in passthroughInfo.Headers)
                    {
                        request.Headers.Add(pair.Key, pair.Value);
                    }
                }

                var response = await client.SendAsync(request);

                return new HttpResponseMessage(response.StatusCode)
                {
                    Content = response.Content
                };
            }
        }

        private string GetToken()
        {
            return Request.Headers.GetValues(Constants.X_MS_OAUTH_TOKEN).FirstOrDefault();
        }

        private HttpClient GetClient(string baseUri = null)
        {
            var client = new HttpClient();
            if (!string.IsNullOrEmpty(baseUri))
            {
                client.BaseAddress = new Uri(baseUri);
            }
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", GetToken());
            client.DefaultRequestHeaders.Add("User-Agent", Request.RequestUri.Host);
            client.DefaultRequestHeaders.Add("Accept", Constants.ApplicationJson);
            return client;
        }
    }
}