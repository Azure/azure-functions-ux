using AzureFunctions.Code.Extensions;
using AzureFunctions.Common;
using AzureFunctions.Contracts;
using AzureFunctions.Trace;
using System.Net.Http;
using System.Threading.Tasks;
using AzureFunctions.Models;

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

        public async Task<UIResource> CreateTrialFunctionsResource()
        {
            using (var perf = FunctionsTrace.BeginTimedOperation())
            {
                var response = await _client.PostAsJsonAsync(Constants.TryAppServiceCreateUrl, new { name = "FunctionsContainer" });
                perf.AddProperties("FunctionCreateResponse");
                return await response.EnsureSuccessStatusCodeWithFullError().Result.Content.ReadAsAsync<UIResource>();
            }
        }
        public async Task<UIResource> GetTrialFunctionsResource()
        {
            using (var perf = FunctionsTrace.BeginTimedOperation())
            {
                var response = await _client.GetAsync(Constants.TryAppServiceCreateUrl);
                perf.AddProperties("FunctionGetResponse");
                return await response.EnsureSuccessStatusCodeWithFullError().Result.Content.ReadAsAsync<UIResource>();
            }
        }
        public async Task<UIResource> ExtendTrialFunctionsResource()
        {
            using (var perf = FunctionsTrace.BeginTimedOperation())
            {
                var response = await _client.PostAsJsonAsync(Constants.TryAppServiceExtendTrial, new { });
                perf.AddProperties("ExtendTrialResponse");
                return await response.EnsureSuccessStatusCodeWithFullError().Result.Content.ReadAsAsync<UIResource>();
            }
        }
    }
}