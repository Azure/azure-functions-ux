using AzureFunctions.Common;
using AzureFunctions.Contracts;
using AzureFunctions.Models;
using AzureFunctions.Trace;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;

namespace AzureFunctions.Controllers
{
    public class AzureFunctionsController : ApiController
    {
        private readonly IArmManager _armManager;
        private readonly ITemplatesManager _templatesManager;
        private readonly HttpClient _client;

        public AzureFunctionsController(IArmManager armManager, ITemplatesManager templatesManager, HttpClient client)
        {
            this._armManager = armManager;
            this._templatesManager = templatesManager;
            this._client = client;
        }

        //[Authorize]
        //[HttpPost]
        //public async Task<HttpResponseMessage> CreateTrialFunctionsContainer()
        //{
        //    using (var perf = FunctionsTrace.BeginTimedOperation())
        //    {
        //        try
        //        {
        //            await this._armManager.CreateTrialFunctionContainer();
        //            perf.AddProperties("Created");
        //            return Request.CreateResponse(HttpStatusCode.Created);
        //        }
        //        catch (Exception e)
        //        {
        //           perf.AddProperties("Error");
        //            FunctionsTrace.Diagnostics.Event(TracingEvents.ErrorInCreateTrialFunctionContainer, e.Message);
        //            return Request.CreateResponse(HttpStatusCode.InternalServerError, e);
        //        }
        //    }
        //}

        [Authorize]
        [HttpPost]
        public async Task<HttpResponseMessage> Passthrough([FromBody]PassthroughInfo passthroughInfo)
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

            var response = await _client.SendAsync(request);

            return new HttpResponseMessage(response.StatusCode)
            {
                Content = response.Content
            };
        }

        [Authorize]
        [HttpGet]
        public HttpResponseMessage ListTemplates()
        {
            using (FunctionsTrace.BeginTimedOperation())
            {
                return Request.CreateResponse(HttpStatusCode.OK, _templatesManager.GetTemplates());
            }
        }

        [Authorize]
        [HttpPost]
        public async Task<HttpResponseMessage> CreateFunction([FromBody]CreateFunctionInfo createFunctionInfo)
        {
            using (FunctionsTrace.BeginTimedOperation())
            {
                if (createFunctionInfo == null ||
                    string.IsNullOrEmpty(createFunctionInfo.Name) ||
                    string.IsNullOrEmpty(createFunctionInfo.ContainerScmUrl))
                {
                    return Request.CreateResponse(HttpStatusCode.BadRequest, $"{nameof(createFunctionInfo)} can not be null");
                }

                IDictionary<string, string> templateContent = null;
                if (!string.IsNullOrEmpty(createFunctionInfo.TemplateId))
                {
                    templateContent = await _templatesManager.GetTemplateContentAsync(createFunctionInfo.TemplateId);
                    if (templateContent == null)
                    {
                        throw new FileNotFoundException($"Template {createFunctionInfo.TemplateId} does not exist");
                    }
                }

                var url = $"{createFunctionInfo.ContainerScmUrl.TrimEnd('/')}/api/functions/{createFunctionInfo.Name}";
                var response = await _client.PutAsJsonAsync(url, new { files = templateContent });
                return new HttpResponseMessage(response.StatusCode)
                {
                    Content = response.Content
                };
            }
        }

        [Authorize]
        [HttpPost]
        public async Task<HttpResponseMessage> CreateFunctionV2([FromBody]CreateFunctionInfoV2 createFunctionInfo)
        {
            using (FunctionsTrace.BeginTimedOperation())
            {
                if (createFunctionInfo == null ||
                    string.IsNullOrEmpty(createFunctionInfo.Name) ||
                    string.IsNullOrEmpty(createFunctionInfo.ContainerScmUrl))
                {
                    return Request.CreateResponse(HttpStatusCode.BadRequest, $"{nameof(createFunctionInfo)} can not be null");
                }

                var url = $"{createFunctionInfo.ContainerScmUrl.TrimEnd('/')}/api/functions/{createFunctionInfo.Name}";
                var response = await _client.PutAsJsonAsync(url, new { files = createFunctionInfo.files });
                return new HttpResponseMessage(response.StatusCode)
                {
                    Content = response.Content
                };
            }
        }

        [Authorize]
        [HttpGet]
        public async Task<HttpResponseMessage> GetBindingConfig()
        {
            return Request.CreateResponse(HttpStatusCode.OK, await _templatesManager.GetBindingConfigAsync());
        }

        [Authorize]
        [HttpPost]
        public HttpResponseMessage ReportClientError([FromBody] ClientError clientError)
        {
            FunctionsTrace.Diagnostics.Error(new Exception(clientError.Message), TracingEvents.ClientError.Message, clientError.Message, clientError.StackTrace);
            return Request.CreateResponse(HttpStatusCode.Accepted);
        }
    }
}