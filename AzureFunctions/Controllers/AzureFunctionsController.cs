using AzureFunctions.Code;
using AzureFunctions.Code.Extensions;
using AzureFunctions.Common;
using AzureFunctions.Contracts;
using AzureFunctions.Models;
using AzureFunctions.Models.ArmModels;
using AzureFunctions.Models.ArmResources;
using AzureFunctions.Modules;
using AzureFunctions.Trace;
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
        [HttpGet]
        public async Task<HttpResponseMessage> GetFunctionContainer(string resourceId = null)
        {
            using (var perf = FunctionsTrace.BeginTimedOperation($"{nameof(resourceId)}:{resourceId.NullStatus()}"))
            {
                try
                {
                    var savedFunctionContainer = resourceId ?? Request.Headers
                        .GetCookies(Constants.SavedFunctionsContainer)
                        ?.FirstOrDefault()
                        ?[Constants.SavedFunctionsContainer]
                        ?.Value;

                    var functionContainer = await this._armManager.GetFunctionContainer(savedFunctionContainer);

                    if (functionContainer == null)
                    {
                        perf.AddProperties("NotFound");
                        var response = Request.CreateResponse(HttpStatusCode.NotFound);
                        response.Headers.AddCookies(
                            new[]
                            {
                            new CookieHeaderValue(Constants.SavedFunctionsContainer, string.Empty)
                            { Expires = DateTimeOffset.UtcNow.AddDays(-1), Path = "/" }
                            });
                        return response;
                    }
                    else
                    {
                        perf.AddProperties("Found");
                        var response = Request.CreateResponse(HttpStatusCode.OK, functionContainer);
                        response.Headers.AddCookies(
                            new[]
                            {
                            new CookieHeaderValue(Constants.SavedFunctionsContainer, functionContainer.ArmId)
                            { Expires = DateTimeOffset.UtcNow.AddYears(1), Path = "/" }
                            });
                        return response;
                    }
                }
                catch (Exception e)
                {
                    perf.AddProperties("Error");
                    FunctionsTrace.Diagnostics.Error("Error in GetFunctionContainer(), {Exception}", e.Message);
                    return Request.CreateResponse(HttpStatusCode.InternalServerError, e);
                }
            }
        }

        [Authorize]
        [HttpPost]
        public async Task<HttpResponseMessage> CreateFunctionsContainer(string subscriptionId, string location, string serverFarmId = null)
        {
            using (var perf = FunctionsTrace.BeginTimedOperation($"{nameof(subscriptionId)}, {nameof(location)}, {nameof(serverFarmId)}:{serverFarmId.NullStatus()}"))
            {
                try
                {
                    return Request.CreateResponse(HttpStatusCode.Created, await _armManager.CreateFunctionContainer(subscriptionId, location, serverFarmId));
                }
                catch (Exception e)
                {
                    FunctionsTrace.Diagnostics.Error($"Error in CreateFunctionsContainer({subscriptionId}, {location}, {serverFarmId}) {{Exception}}", e.Message);
                    return Request.CreateResponse(HttpStatusCode.InternalServerError, e);
                }
            }
        }

        [Authorize]
        [HttpPost]
        public async Task<HttpResponseMessage> CreateTrialFunctionsContainer()
        {
            using (var perf = FunctionsTrace.BeginTimedOperation())
            {
                try
                {
                    await this._armManager.CreateTrialFunctionContainer();
                    perf.AddProperties("Created");
                    return Request.CreateResponse(HttpStatusCode.Created);
                }
                catch (Exception e)
                {
                    perf.AddProperties("Error");
                    FunctionsTrace.Diagnostics.Error("Error in CreateTrialFunctionsContainer() {Exception}", e.Message);
                    return Request.CreateResponse(HttpStatusCode.InternalServerError, e);
                }
            }
        }

        [Authorize]
        [HttpGet]
        public async Task<HttpResponseMessage> ListSubscriptions()
        {
            using (var perf = FunctionsTrace.BeginTimedOperation())
            {
                return Request.CreateResponse(HttpStatusCode.OK, await _armManager.GetSubscriptions());
            }
        }

        [Authorize]
        [HttpGet]
        public async Task<HttpResponseMessage> ListServerFarms()
        {
            using (var perf = FunctionsTrace.BeginTimedOperation())
            {
                return Request.CreateResponse(HttpStatusCode.OK, await _armManager.GetServerFarms());
            }
        }

        [Authorize]
        [HttpPost]
        public async Task<HttpResponseMessage> Passthrough(PassthroughInfo passthroughInfo)
        {
            using (var perf = FunctionsTrace.BeginTimedOperation())
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

        private HttpClient GetClient()
        {
            var client = new HttpClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", GetToken());
            client.DefaultRequestHeaders.Add("User-Agent", Request.RequestUri.Host);
            client.DefaultRequestHeaders.Add("Accept", Constants.ApplicationJson);
            return client;
        }
    }
}