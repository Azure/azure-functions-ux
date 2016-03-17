using AzureFunctions.Contracts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using AzureFunctions.Models;
using System.Threading.Tasks;
using System.Net.Http;
using AzureFunctions.Common;
using System.Net.Http.Headers;
using AzureFunctions.Code.Extensions;
using AzureFunctions.Models.ArmResources;
using AzureFunctions.Trace;
using Serilog;
using Serilog.Context;

namespace AzureFunctions.Code
{
    public class ArmManager : IArmManager
    {
        private readonly HttpClient _client;
        private readonly IUserSettings _userSettings;
        private readonly ISettings _settings;

        public ArmManager(IUserSettings userSettings, ISettings settings, HttpClient client)
        {
            this._userSettings = userSettings;
            this._settings = settings;
            this._client = client;
        }

        public async Task CreateTrialFunctionContainer()
        {
            using (var perf = FunctionsTrace.BeginTimedOperation())
            {
                var response = await _client.PostAsJsonAsync(Constants.TryAppServiceCreateUrl, new { name = "FunctionsContainer" });
                await response.EnsureSuccessStatusCodeWithFullError();
            }
        }
    }
}