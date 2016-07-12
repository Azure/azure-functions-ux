using AzureFunctions.Common;
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

        //[Authorize]
        [HttpGet]
        public HttpResponseMessage GetToken(bool plainText = false)
        {
            var jwtToken =
                "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Ik1uQ19WWmNBVGZNNXBPWWlKSE1iYTlnb0VLWSIsImtpZCI6Ik1uQ19WWmNBVGZNNXBPWWlKSE1iYTlnb0VLWSJ9.eyJhdWQiOiJodHRwczovL21hbmFnZW1lbnQuY29yZS53aW5kb3dzLm5ldC8iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC82MjI0YmNjMS0xNjkwLTRkMDQtYjkwNS05MjI2NWY5NDhkYWQvIiwiaWF0IjoxNDY4MjYzMTI3LCJuYmYiOjE0NjgyNjMxMjcsImV4cCI6MTQ2ODI2NzAyNywiYWNyIjoiMSIsImFsdHNlY2lkIjoiMTpsaXZlLmNvbTowMDAzQkZGREZCOTA0QUUzIiwiYW1yIjpbInB3ZCJdLCJhcHBpZCI6ImFiZmEwYTdjLWE2YjYtNDczNi04MzEwLTU4NTU1MDg3ODdjZCIsImFwcGlkYWNyIjoiMiIsImVtYWlsIjoiZmFpenNoYWlraDdAb3V0bG9vay5jb20iLCJmYW1pbHlfbmFtZSI6IlNoYWlraCIsImdpdmVuX25hbWUiOiJGYWl6IiwiaWRwIjoibGl2ZS5jb20iLCJpcGFkZHIiOiIxMzEuMTA3LjE3NC43NyIsIm5hbWUiOiJmYWl6c2hhaWtoN0BvdXRsb29rLmNvbSIsIm9pZCI6IjM1NjQxYzkxLTEyZmMtNDhmYS05YjJmLTI3YjI2NzU1ZWI4YiIsInB1aWQiOiIxMDAzN0ZGRTk4MkZCNjM5Iiwic2NwIjoidXNlcl9pbXBlcnNvbmF0aW9uIiwic3ViIjoiVXBlc1g0MXZsOVJQVy12U1loNC1JRFdTQUJfendzbWd2LWRqN2hkVGNJRSIsInRpZCI6IjYyMjRiY2MxLTE2OTAtNGQwNC1iOTA1LTkyMjY1Zjk0OGRhZCIsInVuaXF1ZV9uYW1lIjoibGl2ZS5jb20jZmFpenNoYWlraDdAb3V0bG9vay5jb20iLCJ2ZXIiOiIxLjAifQ.iYWjMwFaoniClvvhXoiAdA3lilqkaIms0fBzlNZmvteIJxbZT80iCEGVCGFeGLSgC0t2Gp5YUXWhZ1-dN4k_1HjhOPOZi-KgIYChBjN319At_O3Sam3nVIvH5g2w1DeBlT6KgEQ1QabhbhIRwnXXj-5c6TirQjJ3lGinvoLqbgtL1b8KHXPWs37Va4470uJLX3GliFIhUp6-AYQPNuL1B8hycOUuy9Jga5QEKlDXVilJetJdptLQQxnTwuh9b3tpZFnxCsKPKIrMcxa6O003bqU1WBYVIqDYVVo2ouPkZdg8jQaagM6l176b_vKZ4aulIBD5d5AX_koNKF9dCcRgkA";
            if (plainText)
            {
                //jwtToken = Request.Headers.GetValues(Constants.X_MS_OAUTH_TOKEN).FirstOrDefault();
                var response = Request.CreateResponse(HttpStatusCode.OK);
                response.Content = new StringContent(jwtToken, Encoding.UTF8, "text/plain");
                return response;
            }
            else
            {
                var response = Request.CreateResponse(HttpStatusCode.OK);
                response.Content = new StringContent(GetClaims(jwtToken).ToString(), Encoding.UTF8, "application/json");
                return response;
            }

        }

        [Authorize]
        [HttpGet]
        public async Task<HttpResponseMessage> GetTenants()
        {
            if (!Request.RequestUri.IsLoopback)
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
                using (var client = GetClient("https://management.azure.com/"))
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

        private JObject GetClaims(string jwtToken= "")
        {
            if (String.IsNullOrEmpty(jwtToken))
            jwtToken = Request.Headers.GetValues(Constants.X_MS_OAUTH_TOKEN).FirstOrDefault();
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