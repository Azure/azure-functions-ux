using AzureFunctions.Common;
using AzureFunctions.Contracts;
using AzureFunctions.Models;
using Newtonsoft.Json.Linq;
using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;

namespace AzureFunctions.Controllers
{
    public class ARMController : ApiController
    {
        private const char base64Character62 = '+';
        private const char base64Character63 = '/';
        private const char base64UrlCharacter62 = '-';
        private const char base64UrlCharacter63 = '_';

        private readonly ISettings _settings;

        public ARMController(ISettings settings)
        {
            this._settings = settings;
        }

        [Authorize]
        [HttpGet]
        public HttpResponseMessage GetToken(bool plainText = false)
        {
            if (plainText)
            {
                var jwtToken = Request.Headers.GetValues(Constants.X_MS_OAUTH_TOKEN).FirstOrDefault();
                var response = Request.CreateResponse(HttpStatusCode.OK);
                response.Content = new StringContent(jwtToken, Encoding.UTF8, "text/plain");
                return response;
            }
            else
            {
                var response = Request.CreateResponse(HttpStatusCode.OK);
                response.Content = new StringContent(GetClaims().ToString(), Encoding.UTF8, "application/json");
                return response;
            }
        }

        [Authorize]
        [HttpGet]
        public async Task<HttpResponseMessage> GetTenants()
        {
            if (!Request.RequestUri.IsLoopback && _settings.RuntimeType != RuntimeType.OnPrem)
            {
                using (var client = GetClient(Request.RequestUri.GetLeftPart(UriPartial.Authority)))
                {
                    var response = await client.GetAsync("tenantdetails");
                    if (!response.IsSuccessStatusCode)
                    {
                        return response;
                    }

                    var tenantsString = await response.Content.ReadAsStringAsync();
                    var tenants = JArray.Parse(tenantsString);
                    tenants = SetCurrentTenant(tenants);
                    response = Request.CreateResponse(response.StatusCode);
                    response.Content = new StringContent(tenants.ToString(), Encoding.UTF8, "application/json");
                    return response;
                }
            }
            else
            {
                using (var client = GetClient(this._settings.AzureResourceManagerEndpoint))
                {
                    var response = await client.GetAsync("tenants?api-version=2014-04-01");
                    if (!response.IsSuccessStatusCode)
                    {
                        return response;
                    }

                    var tenantsString = await response.Content.ReadAsStringAsync();
                    var tenants = (JArray)(JObject.Parse(tenantsString))["value"];
                    tenants = SetCurrentTenant(ToTenantDetails(tenants));
                    response = Request.CreateResponse(response.StatusCode);
                    response.Content = new StringContent(tenants.ToString(), Encoding.UTF8, "application/json");
                    return response;
                }
            }
        }

        [Authorize]
        [HttpGet]
        public HttpResponseMessage SwitchTenants(string tenantId, string path = null)
        {
            // switch tenant
            var tenant = Guid.Parse(tenantId);
            //KeyValuePair is a struct not a class. It can't be null.
            var contextQuery = Request.GetQueryNameValuePairs().FirstOrDefault(s => s.Key.Equals("cx", StringComparison.OrdinalIgnoreCase)).Value ?? string.Empty;
            var response = Request.CreateResponse(HttpStatusCode.Redirect);
            response.Headers.Add("Set-Cookie", String.Format("OAuthTenant={0}; path=/; secure; HttpOnly", tenant));
            var uri = Request.RequestUri.AbsoluteUri;
            var query = Request.RequestUri.Query;
            var baseUri = new Uri($"{uri.Substring(0, uri.IndexOf("/api/", StringComparison.OrdinalIgnoreCase))}/{path}{query}");
            response.Headers.Location = new Uri(baseUri, WebUtility.UrlDecode(contextQuery));
            return response;
        }

        private JArray ToTenantDetails(JArray tenants)
        {
            var result = new JArray();
            foreach (var tenant in tenants)
            {
                var value = new JObject();
                value["DisplayName"] = tenant["tenantId"];
                value["DomainName"] = tenant["tenantId"];
                value["TenantId"] = tenant["tenantId"];
                result.Add(value);
            }
            return result;
        }

        private JArray SetCurrentTenant(JArray tenants)
        {
            var tid = (string)GetClaims()["tid"];
            foreach (var tenant in tenants)
            {
                tenant["Current"] = (string)tenant["TenantId"] == tid;
            }
            return tenants;
        }

        private HttpClient GetClient(string baseUri)
        {
            var client = new HttpClient();
            client.BaseAddress = new Uri(baseUri);
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer",
                Request.Headers.GetValues(Constants.X_MS_OAUTH_TOKEN).FirstOrDefault());
            client.DefaultRequestHeaders.Add("User-Agent", Request.RequestUri.Host);
            client.DefaultRequestHeaders.Add("Accept", Constants.ApplicationJson);
            return client;
        }

        private JObject GetClaims()
        {
            var jwtToken = Request.Headers.GetValues(Constants.X_MS_OAUTH_TOKEN).FirstOrDefault();
            var base64 = jwtToken.Split('.')[1];

            // fixup
            int mod4 = base64.Length % 4;
            if (mod4 > 0)
            {
                base64 += new string('=', 4 - mod4);
            }

            // decode url escape char
            base64 = base64.Replace(base64UrlCharacter62, base64Character62);
            base64 = base64.Replace(base64UrlCharacter63, base64Character63);

            var json = Encoding.UTF8.GetString(Convert.FromBase64String(base64));
            return JObject.Parse(json);
        }
    }
}