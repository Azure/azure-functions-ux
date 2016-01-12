using AzureFunctions.Code;
using AzureFunctions.Common;
using AzureFunctions.Models;
using AzureFunctions.Models.ArmModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace AzureFunctions.Controllers
{
    public class AzureFunctionsController : ApiController
    {
        [Authorize]
        [HttpPost]
        public async Task<HttpResponseMessage> InitializeUser()
        {
            using (var client = GetClient(Constants.CSMUrl))
            {
                // Get first sub
                var subscriptionsResponse = await client.GetAsync(ArmUriTemplates.Subscriptions.Bind(string.Empty));
                subscriptionsResponse.EnsureSuccessStatusCode();
                var subscriptions = await subscriptionsResponse.Content.ReadAsAsync<ArmSubscriptionsArray>();
                var subscription = subscriptions.value.FirstOrDefault(s => s.displayName.IndexOf("msdn") != -1) ?? subscriptions.value.FirstOrDefault();

                // look for a rg that starts with AzureFunctionsResourceGroup
                var resourceGroupsResponse = await client.GetAsync(ArmUriTemplates.ResourceGroups.Bind(new { subscriptionId = subscription.subscriptionId }));
                resourceGroupsResponse.EnsureSuccessStatusCode();
                var resourceGroups = await resourceGroupsResponse.Content.ReadAsAsync<ArmArrayWrapper<ArmResourceGroup>>();
                var resourceGroup = resourceGroups.value.FirstOrDefault(rg => rg.name.Equals("AzureFunctionsResourceGroup", StringComparison.OrdinalIgnoreCase));
                if (resourceGroup == null)
                {
                    //create it
                    var createRGResponse = await client.PutAsJsonAsync(ArmUriTemplates.ResourceGroup.Bind(new { subscriptionId = subscription.subscriptionId, resourceGroupName = "AzureFunctionsResourceGroup" }), new { properties = new { }, location = "West US" });
                    createRGResponse.EnsureSuccessStatusCode();
                    resourceGroup = await createRGResponse.Content.ReadAsAsync<ArmWrapper<ArmResourceGroup>>();
                }

                // look for a site that starts with AzureFunctionsContainer{random}
                var sitesResponse = await client.GetAsync(ArmUriTemplates.Sites.Bind(new { subscriptionId = subscription.subscriptionId, resourceGroupName = resourceGroup.name }));
                sitesResponse.EnsureSuccessStatusCode();
                var sites = await sitesResponse.Content.ReadAsAsync<ArmArrayWrapper<ArmWebsite>>();
                var site = sites.value.FirstOrDefault(s => s.name.StartsWith("AzureFunctionsContainer", StringComparison.OrdinalIgnoreCase));
                if (site == null)
                {
                    //create it
                    var siteName = $"AzureFunctionsContainer{Guid.NewGuid().ToString().Replace("-", "")}";
                    var createSiteResponse = await client.PutAsJsonAsync(ArmUriTemplates.Site.Bind(new { subscriptionId = subscription.subscriptionId, resourceGroupName = resourceGroup.name, siteName = siteName }), new { properties = new { }, location = resourceGroup.location });
                    createSiteResponse.EnsureSuccessStatusCode();
                    site = await createSiteResponse.Content.ReadAsAsync<ArmWrapper<ArmWebsite>>();
                }

                // return it's scm name
                return Request.CreateResponse(HttpStatusCode.OK, new { scm_url = site.properties.enabledHostNames.FirstOrDefault(h => h.IndexOf(".scm.", StringComparison.OrdinalIgnoreCase) != -1) });
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
                    request.Content = new StringContent(passthroughInfo.RequestBody.ToString(), Encoding.UTF8, Constants.ApplicationJson);
                }
                return await client.SendAsync(request);
            }
        }

        private HttpClient GetClient(string baseUri = null)
        {
            var client = new HttpClient();
            if (!string.IsNullOrEmpty(baseUri))
            {
                client.BaseAddress = new Uri(baseUri);
            }
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer",
                Request.Headers.GetValues(Constants.X_MS_OAUTH_TOKEN).FirstOrDefault());
            client.DefaultRequestHeaders.Add("User-Agent", Request.RequestUri.Host);
            client.DefaultRequestHeaders.Add("Accept", Constants.ApplicationJson);
            return client;
        }
    }
}