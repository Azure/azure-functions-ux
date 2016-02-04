using AzureFunctions.Code;
using AzureFunctions.Code.Extensions;
using AzureFunctions.Common;
using AzureFunctions.Contracts;
using AzureFunctions.Models;
using AzureFunctions.Models.ArmModels;
using AzureFunctions.Models.ArmResources;
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
        [HttpGet]
        public async Task<HttpResponseMessage> GetFunctionContainer()
        {
            try
            {
                var functionContainer = await this._armManager.GetFunctionContainer();
                return functionContainer == null
                    ? Request.CreateResponse(HttpStatusCode.NotFound)
                    : Request.CreateResponse(HttpStatusCode.OK, functionContainer);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e);
            }
        }

        [Authorize]
        [HttpPost]
        public async Task<HttpResponseMessage> CreateFunctionsContainer(string subscriptionId, string location, string serverFarmId)
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.Created, await _armManager.CreateFunctionContainer(subscriptionId, location, serverFarmId));
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e);
            }
        }

        [Authorize]
        [HttpGet]
        public async Task<HttpResponseMessage> ListSubscriptions()
        {
            return Request.CreateResponse(HttpStatusCode.OK, await _armManager.GetSubscriptions());
        }

        [Authorize]
        [HttpGet]
        public async Task<HttpResponseMessage> ListServerFarms()
        {
            return Request.CreateResponse(HttpStatusCode.OK, await _armManager.GetServerFarms());
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