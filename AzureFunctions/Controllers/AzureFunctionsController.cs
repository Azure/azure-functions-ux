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
        private readonly ITemplatesManager _templatesManager;
        private readonly HttpClient _client;

        public AzureFunctionsController(ITemplatesManager templatesManager, HttpClient client)
        {
            this._templatesManager = templatesManager;
            this._client = client;
        }

        [HttpGet]
        public HttpResponseMessage ListTemplates()
        {
            using (FunctionsTrace.BeginTimedOperation())
            {
                return Request.CreateResponse(HttpStatusCode.OK, _templatesManager.GetTemplates());
            }
        }

        [HttpGet]
        public async Task<HttpResponseMessage> GetBindingConfig()
        {
            return Request.CreateResponse(HttpStatusCode.OK, await _templatesManager.GetBindingConfigAsync());
        }

        [HttpPost]
        public HttpResponseMessage ReportClientError([FromBody] ClientError clientError)
        {
            FunctionsTrace.Diagnostics.Error(new Exception(clientError.Message), TracingEvents.ClientError.Message, clientError.Message, clientError.StackTrace);
            return Request.CreateResponse(HttpStatusCode.Accepted);
        }
    }
}