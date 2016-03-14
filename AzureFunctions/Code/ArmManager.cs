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
    public partial class ArmManager : IArmManager
    {
        private readonly HttpClient _client;
        private readonly IUserSettings _userSettings;
        private readonly ISettings _settings;

        private HttpContent NullContent { get { return new StringContent(string.Empty); } }

        public ArmManager(IUserSettings userSettings, ISettings settings, HttpClient client)
        {
            this._userSettings = userSettings;
            this._settings = settings;
            this._client = client;
        }

        public async Task<FunctionsContainer> GetFunctionContainer(string functionContainerId)
        {
            using (var perf = FunctionsTrace.BeginTimedOperation($"{nameof(functionContainerId)}:{functionContainerId.NullStatus()}"))
            {
                var functionContainer = await InternalGetFunctionsContainer(functionContainerId);
                if (functionContainer != null)
                {
                    perf.AddProperties("PreCreated");
                    return functionContainer;
                }

                var resourceGroup = await GetFunctionsResourceGroup();
                if (resourceGroup != null)
                {
                    perf.AddProperties("CreatedOrUpdated");
                    return await CreateFunctionContainer(resourceGroup);
                }
                else
                {
                    perf.AddProperties("NotFound");
                    return null;
                }
            }
        }

        private async Task<FunctionsContainer> InternalGetFunctionsContainer(string armId)
        {
            using (var perf = FunctionsTrace.BeginTimedOperation($"{nameof(armId)}:{armId.NullStatus()}"))
            {
                if (!string.IsNullOrEmpty(armId))
                {
                    try
                    {
                        //  /subscriptions/{0}/resourceGroups/{1}/providers/Microsoft.Web/sites/{2}
                        var parts = armId.Split(new[] { '/' }, StringSplitOptions.RemoveEmptyEntries);
                        var site = await Load(new Site(parts[1], parts[3], parts[7]));
                        perf.AddProperties("Found");
                        return new FunctionsContainer
                        {
                            ScmUrl = site.ScmHostName,
                            BasicAuth = site.BasicAuth,
                            Bearer = this._userSettings.BearerToken,
                            ArmId = site.ArmId
                        };
                    }
                    catch { }
                }
                perf.AddProperties("NotFound");
                return null;
            }
        }

        public async Task<ResourceGroup> GetFunctionsResourceGroup(string subscriptionId = null)
        {
            using (var perf = FunctionsTrace.BeginTimedOperation($"{nameof(subscriptionId)}:{subscriptionId.NullStatus()}"))
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
        }

        public async Task<FunctionsContainer> CreateFunctionContainer(string subscriptionId, string location, string serverFarmId = null)
        {
            var resourceGroup = await GetFunctionsResourceGroup(subscriptionId) ?? await CreateResourceGroup(subscriptionId, location);
            return await CreateFunctionContainer(resourceGroup, serverFarmId);
        }

        public async Task<FunctionsContainer> CreateFunctionContainer(ResourceGroup resourceGroup, string serverFarmId = null)
        {
            using (FunctionsTrace.BeginTimedOperation($"{nameof(resourceGroup)}, {nameof(serverFarmId)}:{(serverFarmId.NullStatus())}"))
            {
                if (resourceGroup.FunctionsStorageAccount == null)
                {
                    resourceGroup.FunctionsStorageAccount = await CreateFunctionsStorageAccount(resourceGroup);
                }
                else
                {
                    await Load(resourceGroup.FunctionsStorageAccount);
                }

                if (resourceGroup.FunctionsSite == null)
                {
                    resourceGroup.FunctionsSite = await CreateFunctionsSite(resourceGroup, serverFarmId);
                }
                else
                {
                    await Load(resourceGroup.FunctionsSite);
                }

                await UpdateSiteAppSettings(resourceGroup.FunctionsSite, resourceGroup.FunctionsStorageAccount);

                return new FunctionsContainer
                {
                    ScmUrl = resourceGroup.FunctionsSite.ScmHostName,
                    BasicAuth = resourceGroup.FunctionsSite.BasicAuth,
                    Bearer = this._userSettings.BearerToken,
                    ArmId = resourceGroup.FunctionsSite.ArmId
                };
            }
        }

        public async Task UpdateSiteAppSettings(Site site, StorageAccount storageAccount)
        {
            // Assumes site and storage are loaded
            var update = false;
            if (!site.AppSettings.ContainsKey(Constants.AzureStorageAppSettingsName))
            {
                site.AppSettings[Constants.AzureStorageAppSettingsName] = string.Format(Constants.StorageConnectionStringTemplate, storageAccount.StorageAccountName, storageAccount.StorageAccountKey);
                site.AppSettings[Constants.AzureStorageDashboardAppSettingsName] = string.Format(Constants.StorageConnectionStringTemplate, storageAccount.StorageAccountName, storageAccount.StorageAccountKey);
                update = true;
            }

            if (!site.AppSettings.ContainsKey(Constants.FunctionsExtensionVersion))
            {
                site.AppSettings[Constants.FunctionsExtensionVersion] = Constants.Latest;
                update = true;
            }

            if (update)
                await UpdateSiteAppSettings(site);
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