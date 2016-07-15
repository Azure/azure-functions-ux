using AzureFunctions.Common;
using AzureFunctions.Contracts;
using AzureFunctions.Models;
using AzureFunctions.Trace;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Resources;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;
using System.Linq;
using Newtonsoft.Json.Linq;
using System.Web;

namespace AzureFunctions.Controllers
{
    public class AzureFunctionsController : ApiController
    {
        private readonly IArmManager _armManager;
        private readonly ITemplatesManager _templatesManager;
        private readonly HttpClient _client;
        private readonly ISettings _settings;

        public AzureFunctionsController(IArmManager armManager, ITemplatesManager templatesManager, HttpClient client, ISettings settings)
        {
            this._armManager = armManager;
            this._templatesManager = templatesManager;
            this._client = client;
            this._settings = settings;
        }

        [Authorize]
        [HttpPost]
        public async Task<HttpResponseMessage> CreateTrialFunctionsResource()
        {
            using (var perf = FunctionsTrace.BeginTimedOperation())
            {
                try
                {
                    var functionsResource = await this._armManager.CreateTrialFunctionsResource();
                    perf.AddProperties("Created");
                    return Request.CreateResponse(HttpStatusCode.Created, functionsResource);

                }
                catch (Exception e)
                {
                    perf.AddProperties("Error");
                    FunctionsTrace.Diagnostics.Event(TracingEvents.ErrorInCreateTrialFunctionContainer, e.Message);
                    return Request.CreateResponse(HttpStatusCode.InternalServerError, e);
                }
            }
        }
        [Authorize]
        [HttpPost]
        public async Task<HttpResponseMessage> ExtendTrialFunctionsResource()
        {
            using (var perf = FunctionsTrace.BeginTimedOperation())
            {
                try
                {
                    var functionsResource = await this._armManager.ExtendTrialFunctionsResource();
                    perf.AddProperties("Extended");
                    return Request.CreateResponse(HttpStatusCode.OK, functionsResource);

                }
                catch (Exception e)
                {
                    perf.AddProperties("Error");
                    FunctionsTrace.Diagnostics.Event(TracingEvents.ErrorInCreateTrialFunctionContainer, e.Message);
                    return Request.CreateResponse(HttpStatusCode.InternalServerError, e);
                }
            }
        }

        [Authorize]
        [HttpGet]
        public async Task<HttpResponseMessage> GetTrialFunctionsResource()
        {
            using (var perf = FunctionsTrace.BeginTimedOperation())
            {
                try
                {
                    var functionsResource = await this._armManager.GetTrialFunctionsResource();
                    perf.AddProperties("Created");
                    return Request.CreateResponse(HttpStatusCode.OK, functionsResource);
                }
                catch (Exception e)
                {
                    perf.AddProperties("Error");
                    FunctionsTrace.Diagnostics.Event(TracingEvents.ErrorInCreateTrialFunctionContainer, e.Message);
                    return Request.CreateResponse(HttpStatusCode.InternalServerError, e);
                }
            }
        }

        [Authorize]
        [HttpGet]
        public HttpResponseMessage ListTemplates([FromUri] string runtime)
        {
            using (FunctionsTrace.BeginTimedOperation())
            {
                return Request.CreateResponse(HttpStatusCode.OK, _templatesManager.GetTemplates(runtime));
            }
        }

        [Authorize]
        [HttpGet]
        public async Task<HttpResponseMessage> GetBindingConfig([FromUri] string runtime)
        {
            return Request.CreateResponse(HttpStatusCode.OK, await _templatesManager.GetBindingConfigAsync(runtime));
        }

        [Authorize]
        [HttpGet]
        public HttpResponseMessage GetResources([FromUri] string name)
        {
            string fileSuffix = (name == "en") ? "" : "." + name;

            List<string> resxFiles = new List<string>();
            resxFiles.Add(Path.Combine(this._settings.ResourcesPortalPath.Replace(".Client", "") + "\\Resources" + fileSuffix + ".resx"));
            resxFiles.Add(Path.Combine(this._settings.ResourcesTemplatesPath + "\\Resources" + fileSuffix + ".resx"));

            return Request.CreateResponse(HttpStatusCode.OK, ConvertResxToJObject(resxFiles));
        }

        [Authorize]
        [HttpPost]
        public HttpResponseMessage ReportClientError([FromBody] ClientError clientError)
        {
            FunctionsTrace.Diagnostics.Error(new Exception(clientError.Message), TracingEvents.ClientError.Message, clientError.Message, clientError.StackTrace);
            return Request.CreateResponse(HttpStatusCode.Accepted);
        }

        private JObject ConvertResxToJObject(List<string> resxFiles)
        {
            var jo = new JObject();

            foreach (var file in resxFiles) {

                // Create a ResXResourceReader for the file items.resx.
                ResXResourceReader rsxr = new ResXResourceReader(file);

                // Iterate through the resources and display the contents to the console.
                foreach (DictionaryEntry d in rsxr)
                {
                    jo[d.Key.ToString()] = d.Value.ToString();
                }

                //Close the reader.
                rsxr.Close();
            }

            return jo;
        }
    }
}