using AzureFunctions.Contracts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace AzureFunctions.Controllers
{
    public class FunctionContainerController : ApiController
    {
        private IArmManager _armManager;

        public FunctionContainerController(IArmManager armManager)
        {
            this._armManager = armManager;
        }

        [HttpGet]
        public async Task<HttpResponseMessage> List(string subscription)
        {
            return Request.CreateResponse(HttpStatusCode.OK, await _armManager.ListFunctionContainersAsync(subscription));
        }

        [HttpGet]
        public async Task<HttpResponseMessage> Get(string armId)
        {
            return Request.CreateResponse(HttpStatusCode.OK, await _armManager.GetFunctionContainer(armId));
        }

        [HttpPost]
        public async Task<HttpResponseMessage> Create(string subscriptionId, string geoRegion)
        {
            return Request.CreateResponse(HttpStatusCode.OK, await _armManager.CreateFunctionContainerAsync(subscriptionId, geoRegion));
        }
    }
}