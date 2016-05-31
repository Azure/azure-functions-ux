using AzureFunctions.Code.Extensions;
using AzureFunctions.Common;
using AzureFunctions.Contracts;
using AzureFunctions.Trace;
using System.Net.Http;
using System.Threading.Tasks;

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
        public async Task GetTrialTime()
        {
            using (var perf = FunctionsTrace.BeginTimedOperation())
            {
                var response = await _client.GetAsync(Constants.TryAppServiceTrialStatus);
                await response.EnsureSuccessStatusCodeWithFullError();
            }
        }
        public async Task ExtendTrialTime()
        {
            using (var perf = FunctionsTrace.BeginTimedOperation())
            {
                var response = await _client.PostAsJsonAsync(Constants.TryAppServiceExtendTrial, new { });
                await response.EnsureSuccessStatusCodeWithFullError();
            }
        }
    }
}