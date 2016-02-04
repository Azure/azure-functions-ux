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

        public async Task<FunctionContainer> GetFunctionContainer()
        {
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

        public async Task<FunctionContainer> CreateFunctionContainer(string subscriptionId, string location, string serverFarmId = null)
        {
            var resourceGroup = await GetFunctionsResourceGroup(subscriptionId) ?? await CreateResourceGroup(subscriptionId, location);
            return await CreateFunctionContainer(resourceGroup, serverFarmId);
        }

        public async Task<FunctionContainer> CreateFunctionContainer(ResourceGroup resourceGroup, string serverFarmId = null)
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

            if (!resourceGroup.FunctionsSite.AppSettings.ContainsKey(Constants.SiteExtensionsVersion) ||
                !resourceGroup.FunctionsSite.AppSettings[Constants.SiteExtensionsVersion].Equals(await _settings.GetCurrentSiteExtensionVersion(), StringComparison.OrdinalIgnoreCase))
            {
                await PublishCustomSiteExtensions(resourceGroup.FunctionsSite);
            }

            return new FunctionContainer
            {
                ScmUrl = resourceGroup.FunctionsSite.ScmHostName,
                BasicAuth = resourceGroup.FunctionsSite.BasicAuth,
                Bearer = this._userSettings.BearerToken
            };
        }

        public async Task LinkSiteAndStorageAccount(Site site, StorageAccount storageAccount)
        {
            // Assumes site and storage are loaded
            site.AppSettings[Constants.AzureStorageAppSettingsName] = string.Format(Constants.StorageConnectionStringTemplate, storageAccount.StorageAccountName, storageAccount.StorageAccountKey);
            site.AppSettings[Constants.AzureStorageDashboardAppSettingsName] = string.Format(Constants.StorageConnectionStringTemplate, storageAccount.StorageAccountName, storageAccount.StorageAccountKey);
            await UpdateSiteAppSettings(site);
        }

        public void Dispose()
        {
            _client.Dispose();
        }
    }
}