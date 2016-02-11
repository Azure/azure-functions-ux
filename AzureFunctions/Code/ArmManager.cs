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

namespace AzureFunctions.Code
{
    public partial class ArmManager : IArmManager, IDisposable
    {
        private HttpClient _client;
        private IUserSettings _userSettings;
        private ISettings _settings;
        private HttpContent NullContent { get { return new StringContent(string.Empty); } }

        public ArmManager(IUserSettings userSettings, ISettings settings)
        {
            this._userSettings = userSettings;
            this._settings = settings;
            this._client = new HttpClient();
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", this._userSettings.BearerToken);
            _client.DefaultRequestHeaders.Add("User-Agent", Constants.UserAgent);
            _client.DefaultRequestHeaders.Add("Accept", Constants.ApplicationJson);
        }

        public async Task<FunctionsContainer> GetFunctionContainer(string functionContainerId)
        {
            var functionContainer = await InternalGetFunctionsContainer(functionContainerId);
            if (functionContainer != null) return functionContainer;

            var resourceGroup = await GetFunctionsResourceGroup();
            if (resourceGroup != null)
            {
                return await CreateFunctionContainer(resourceGroup);
            }
            else
            {
                return null;
            }
        }

        private async Task<FunctionsContainer> InternalGetFunctionsContainer(string armId)
        {
            if (string.IsNullOrEmpty(armId)) return null;

            try
            {
                //  /subscriptions/{0}/resourceGroups/{1}/providers/Microsoft.Web/sites/{2}
                var parts = armId.Split(new[] { '/' }, StringSplitOptions.RemoveEmptyEntries);
                var site = await Load(new Site(parts[1], parts[3], parts[7]));
                await UpdateCustomSiteExtensionsIfNeeded(site);
                return new FunctionsContainer
                {
                    ScmUrl = site.ScmHostName,
                    BasicAuth = site.BasicAuth,
                    Bearer = this._userSettings.BearerToken,
                    ArmId = site.ArmId
                };
            }
            catch { return null; }
        }

        public async Task<ResourceGroup> GetFunctionsResourceGroup(string subscriptionId = null)
        {
            var subscriptions = await GetSubscriptions();
            if (!string.IsNullOrEmpty(subscriptionId))
            {
                subscriptions = subscriptions.Where(s => s.SubscriptionId.Equals(subscriptionId, StringComparison.OrdinalIgnoreCase));
            }

            subscriptions = await subscriptions.Select(Load).IgnoreAndFilterFailures();
            var resourceGroup = subscriptions
                .Where(s => s.FunctionsResourceGroup != null)
                .Select(s => s.FunctionsResourceGroup)
                .FirstOrDefault();
            return resourceGroup == null
                ? null
                : await Load(resourceGroup);
        }

        public async Task<FunctionsContainer> CreateFunctionContainer(string subscriptionId, string location, string serverFarmId = null)
        {
            var resourceGroup = await GetFunctionsResourceGroup(subscriptionId) ?? await CreateResourceGroup(subscriptionId, location);
            return await CreateFunctionContainer(resourceGroup, serverFarmId);
        }

        public async Task<FunctionsContainer> CreateFunctionContainer(ResourceGroup resourceGroup, string serverFarmId = null)
        {
            var tasks = new List<Task>();
            if (resourceGroup.FunctionsSite == null) tasks.Add(CreateFunctionsSite(resourceGroup, serverFarmId));
            if (resourceGroup.FunctionsStorageAccount == null) tasks.Add(CreateFunctionsStorageAccount(resourceGroup));
            await tasks.WhenAll();

            await new Task[] { Load(resourceGroup.FunctionsSite), Load(resourceGroup.FunctionsStorageAccount) }.WhenAll();
            if (!resourceGroup.FunctionsSite.AppSettings.ContainsKey(Constants.AzureStorageAppSettingsName))
            {
                await LinkSiteAndStorageAccount(resourceGroup.FunctionsSite, resourceGroup.FunctionsStorageAccount);
            }

            await UpdateCustomSiteExtensionsIfNeeded(resourceGroup.FunctionsSite);

            return new FunctionsContainer
            {
                ScmUrl = resourceGroup.FunctionsSite.ScmHostName,
                BasicAuth = resourceGroup.FunctionsSite.BasicAuth,
                Bearer = this._userSettings.BearerToken,
                ArmId = resourceGroup.FunctionsSite.ArmId
            };
        }

        private async Task UpdateCustomSiteExtensionsIfNeeded(Site site)
        {
            if (!site.AppSettings.ContainsKey(Constants.SiteExtensionsVersion) ||
                !site.AppSettings[Constants.SiteExtensionsVersion].Equals(await _settings.GetCurrentSiteExtensionVersion(), StringComparison.OrdinalIgnoreCase))
            {
                await PublishCustomSiteExtensions(site);
            }
        }

        public async Task LinkSiteAndStorageAccount(Site site, StorageAccount storageAccount)
        {
            // Assumes site and storage are loaded
            site.AppSettings[Constants.AzureStorageAppSettingsName] = string.Format(Constants.StorageConnectionStringTemplate, storageAccount.StorageAccountName, storageAccount.StorageAccountKey);
            site.AppSettings[Constants.AzureStorageDashboardAppSettingsName] = string.Format(Constants.StorageConnectionStringTemplate, storageAccount.StorageAccountName, storageAccount.StorageAccountKey);
            await UpdateSiteAppSettings(site);
        }

        public async Task CreateTrialFunctionContainer()
        {
            var response = await _client.PostAsJsonAsync(Constants.TryAppServiceCreateUrl, new { name = "FunctionsContainer" });
            await response.EnsureSuccessStatusCodeWithFullError();
        }


        public void Dispose()
        {
            _client.Dispose();
        }
    }
}