using AzureFunctions.Common;
using AzureFunctions.Contracts;
using AzureFunctions.Models;
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
    public class SubscriptionController : ApiController
    {
        private IArmManager _armManager;

        public SubscriptionController(IArmManager armManager)
        {
            this._armManager = armManager;
        }

        [HttpGet]
        public async Task<HttpResponseMessage> List()
        {
            return Request.CreateResponse(HttpStatusCode.OK, await _armManager.ListSubscriptionsAsync());
        }
    }
}