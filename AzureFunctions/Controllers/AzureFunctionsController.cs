﻿using AzureFunctions.Common;
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
        private readonly ITemplatesManager _templatesManager;

        private readonly ISettings _settings;

        private Dictionary<string, string> _languageMap = new Dictionary<string, string>()
        {
            { "ja", "ja-JP"},
            { "ko", "ko-KR"},
            { "sv", "sv-SE"}
        };

        public AzureFunctionsController(ITemplatesManager templatesManager, ISettings settings)
        {
            this._templatesManager = templatesManager;
            this._settings = settings;
        }

        [HttpGet]
        public HttpResponseMessage ListTemplates([FromUri] string runtime)
        {
            runtime = getClearRuntime(runtime);

            using (FunctionsTrace.BeginTimedOperation())
            {
                return Request.CreateResponse(HttpStatusCode.OK, _templatesManager.GetTemplates(runtime));
            }
        }

        [HttpGet]
        public async Task<HttpResponseMessage> GetBindingConfig([FromUri] string runtime)
        {
            runtime = getClearRuntime(runtime);

            return Request.CreateResponse(HttpStatusCode.OK, await _templatesManager.GetBindingConfigAsync(runtime));
        }

        [HttpGet]
        public HttpResponseMessage GetResources([FromUri] string name, [FromUri] string runtime)
        {
            runtime = getClearRuntime(runtime);
            string folder = "";
            if (name != "en")
            {
                if(name.Length == 2)
                {
                    if (!_languageMap.TryGetValue(name,out folder)) {
                        folder = name + "-" + name;
                    } 
                } else
                {
                    folder = name;
                }
            }

            List<string> resxFiles = new List<string>();
            var result = new JObject();
            if (!string.IsNullOrEmpty(folder))
            {
                resxFiles.Add(Path.Combine(this._settings.ResourcesPortalPath.Replace(".Client", ""), folder + "\\Resources.resx"));
                resxFiles.Add(Path.Combine(this._settings.TemplatesPath, runtime + "\\Resources" + folder + "\\Resources.resx"));
                result["lang"] = ConvertResxToJObject(resxFiles);
                resxFiles.Clear();
            }
            resxFiles.Add(Path.Combine(this._settings.ResourcesPortalPath.Replace(".Client", ""), "Resources.resx"));
            resxFiles.Add(Path.Combine(this._settings.TemplatesPath, runtime + "\\Resources\\Resources.resx"));
            result["en"] = ConvertResxToJObject(resxFiles);

            return Request.CreateResponse(HttpStatusCode.OK, result);
        }

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

                if (File.Exists(file))
                { 
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
            }

            return jo;
        }

        private string getClearRuntime(string runtime)
        {
            return runtime.Replace("~", "");
        }
    }
}