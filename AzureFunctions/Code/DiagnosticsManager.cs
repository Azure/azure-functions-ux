using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using AzureFunctions.Code.Extensions;
using AzureFunctions.Common;
using AzureFunctions.Contracts;
using AzureFunctions.Models;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace AzureFunctions.Code
{
    public class DiagnosticsManager : IDiagnosticsManager
    {
        private readonly IArmClient _client;
        const string AntaresApiVersion = "2015-08-01";

        const string AzureWebJobsStorageAppSetting = "AzureWebJobsStorage";
        const string AzureWebJobsDashboardAppSetting = "AzureWebJobsDashboard";
        const string FunctionsExtensionVersionAppSetting = "FUNCTIONS_EXTENSION_VERSION";
        const string AzureFilesConnectionString = "WEBSITE_CONTENTAZUREFILECONNECTIONSTRING";
        const string AzureFilesContentShare = "WEBSITE_CONTENTSHARE";

        public DiagnosticsManager(IArmClient client)
        {
            _client = client;
        }

        public async Task<IEnumerable<DiagnosticsResult>> Diagnose(string armId)
        {
            // Check resource existence
            Func<DiagnosticsResult, bool> checkReturn = r => !r.IsDiagnosingSuccessful || r.SuccessResult.IsTerminating;
            Func<IEnumerable<DiagnosticsResult>, bool> checkReturns = r => r.Any(checkReturn);

            var resourceExistanceCheckResult = await CheckResource(armId);
            if (checkReturns(resourceExistanceCheckResult.DiagnosticsResults))
            {
                return resourceExistanceCheckResult.DiagnosticsResults;
            }
            var functionApp = resourceExistanceCheckResult.Data;

            // check app settings
            var appSettingsCheckResult = await CheckAppSettings(functionApp);
            if (checkReturns(appSettingsCheckResult.DiagnosticsResults))
            {
                return resourceExistanceCheckResult.DiagnosticsResults
                        .Concat(appSettingsCheckResult.DiagnosticsResults);
            }

            // Check storage existence.
            var storageCheckResult = await CheckStorage(appSettingsCheckResult.Data.Properties[AzureWebJobsStorageAppSetting], AzureWebJobsStorageAppSetting);
            if (checkReturn(storageCheckResult))
            {
                return resourceExistanceCheckResult.DiagnosticsResults
                        .Concat(appSettingsCheckResult.DiagnosticsResults)
                        .Concat(new[] { storageCheckResult });
            }

            // check if it's some cross stamp issue
            var masterKeyResult = await CheckMasterKey(functionApp);
            if (checkReturns(masterKeyResult.DiagnosticsResults))
            {
                return resourceExistanceCheckResult.DiagnosticsResults
                        .Concat(appSettingsCheckResult.DiagnosticsResults)
                        .Concat(new[] { storageCheckResult })
                        .Concat(masterKeyResult.DiagnosticsResults);
            }

            var checkCrossStampResult = await CheckCrossStampResult(functionApp, masterKeyResult.Data);
            if (checkReturn(checkCrossStampResult))
            {
                return resourceExistanceCheckResult.DiagnosticsResults
                        .Concat(appSettingsCheckResult.DiagnosticsResults)
                        .Concat(new[] { storageCheckResult })
                        .Concat(masterKeyResult.DiagnosticsResults)
                        .Concat(new[] { checkCrossStampResult });
            }

            var checkFunctionRuntimeResult = await CheckFunctionRuntimeResult(functionApp, masterKeyResult.Data);

            return resourceExistanceCheckResult.DiagnosticsResults
                    .Concat(appSettingsCheckResult.DiagnosticsResults)
                    .Concat(new[] { storageCheckResult })
                    .Concat(masterKeyResult.DiagnosticsResults)
                    .Concat(new[] { checkCrossStampResult, checkFunctionRuntimeResult });
        }

        private async Task<DiagnosticsResult> CheckFunctionRuntimeResult(ArmResource<ArmFunctionApp> functionApp, string masterKey)
        {
            var uri = new Uri($"https://{functionApp.Properties.DefaultHostName}/");
            var headers = new Dictionary<string, string> { { "x-functions-key", masterKey } };
            var hostStatus = await _client.Get<string>(uri, headers);
            if (!hostStatus.IsSuccessful)
            {
                var content = await hostStatus.Error.Content.ReadAsStringAsync();
                if (content.IndexOf("Function host is not running", StringComparison.OrdinalIgnoreCase) != -1)
                {
                    return new DiagnosticsResult
                    {
                        IsDiagnosingSuccessful = true,
                        Code = GetSupportErrorCode(ActionIds.FunctionRuntimeCrashLoop, functionApp, content, hostStatus),
                        SuccessResult = new DiagnoseSuccessResult
                        {
                            IsTerminating = true,
                            Message = "Function runtime is unable to start correctly.",
                            UserAction = "Check global runtime logs. If you are still unable to figure out the cause, please contact support",
                            ActionId = ActionIds.FunctionRuntimeCrashLoop
                        }
                    };
                }
                else
                {
                    return new DiagnosticsResult
                    {
                        IsDiagnosingSuccessful = true,
                        Code = GetSupportErrorCode(ActionIds.FunctionRuntimeCrashLoop, functionApp, content, hostStatus),
                        SuccessResult = new DiagnoseSuccessResult
                        {
                            IsTerminating = true,
                            Message = "Function runtime is unable to start correctly.",
                            UserAction = "Check global runtime logs. If you are still unable to figure out the cause, please contact support",
                            ActionId = ActionIds.FunctionRuntimeUnknownError
                        }
                    };
                }
            }
            else
            {
                return new DiagnosticsResult { IsDiagnosingSuccessful = true };
            }
        }

        private async Task<TypedPair<string>> CheckMasterKey(ArmResource<ArmFunctionApp> functionApp)
        {
            var scmUrl = functionApp.Properties.HostNameSslStates.First(h => h.HostType == 1).Name;
            var masterKeyResult = await _client.Get<MasterKey>(new Uri($"https://{scmUrl}/api/functions/admin/masterkey"));
            DiagnosticsResult result;
            if (masterKeyResult.IsSuccessful)
            {
                return new TypedPair<string>(new DiagnosticsResult { IsDiagnosingSuccessful = true }, masterKeyResult.Result.Key);
            }
            else if (masterKeyResult.Error.StatusCode == HttpStatusCode.InternalServerError)
            {
                var content = await masterKeyResult.Error.Content.ReadAsAsync<WebApiException>();
                if (!string.IsNullOrEmpty(content.ExceptionType) &&
                    content.ExceptionType.Equals("System.Security.Cryptography.CryptographicException", StringComparison.OrdinalIgnoreCase))
                {
                    result = new DiagnosticsResult
                    {
                        IsDiagnosingSuccessful = true,
                        Code = GetSupportErrorCode(ActionIds.KeysUnexpectedError, content, masterKeyResult.Error, functionApp),
                        SuccessResult = new DiagnoseSuccessResult
                        {
                            IsTerminating = true,
                            Message = "We are unable to decrypt your function access keys. This can happen if you delete and recreate the app with the same name, or if you copied your keys from a different function app.",
                            UserAction = "Follow steps here https://github.com/projectkudu/AzureFunctionsPortal/wiki/Manually-fixing-CryptographicException-when-trying-to-read-function-keys",
                            ActionId = ActionIds.KeysUnexpectedError
                        }
                    };
                }
                else
                {
                    result = new DiagnosticsResult
                    {
                        IsDiagnosingSuccessful = true,
                        Code = GetSupportErrorCode(ActionIds.KeysUnexpectedError, content, masterKeyResult.Error, functionApp),
                        SuccessResult = new DiagnoseSuccessResult
                        {
                            IsTerminating = true,
                            Message = "We are unable to access your function keys.",
                            UserAction = "If the error persists, please contact support.",
                            ActionId = ActionIds.KeysUnexpectedError
                        }
                    };
                }
            }
            else
            {
                result = new DiagnosticsResult
                {
                    IsDiagnosingSuccessful = true,
                    Code = GetSupportErrorCode(ActionIds.KeysUnexpectedError, masterKeyResult.Error, functionApp),
                    SuccessResult = new DiagnoseSuccessResult
                    {
                        IsTerminating = true,
                        Message = "We are unable to access your function keys.",
                        UserAction = "If the error persists, please contact support.",
                        ActionId = ActionIds.KeysUnexpectedError
                    }
                };
            }

            return new TypedPair<string>(result, null);
        }

        private async Task<DiagnosticsResult> CheckCrossStampResult(ArmResource<ArmFunctionApp> functionApp, string masterKey)
        {
            var hostName = functionApp.Properties.DefaultHostName;
            var addresses = await Dns.GetHostAddressesAsync(hostName);

            if (addresses.Count() == 0)
            {
                return new DiagnosticsResult
                {
                    IsDiagnosingSuccessful = true,
                    Code = GetSupportErrorCode(ActionIds.DefaultHostNameNotResolving, functionApp, hostName),
                    SuccessResult = new DiagnoseSuccessResult
                    {
                        IsTerminating = true,
                        Message = string.Format("Your app domain {0} is not registered with DNS or we're not able to resolve it.", hostName),
                        UserAction = "You can wait for DNS TTL to expire, delete and recreate your app, or contact support",
                        ActionId = ActionIds.DefaultHostNameNotResolving
                    }
                };
            }
            else if (addresses.Count() > 1)
            {
                var headers = new Dictionary<string, string>
                {
                    { "HOST", hostName },
                    { "x-functions-key", masterKey }
                };

                var results = await addresses
                    .Select(ip => ip.ToString())
                    .Select(ip => _client.Get<string>(new Uri($"https://{ip}/"), headers))
                    .WhenAll();
                if (results.Where(r => r.IsSuccessful).Count() != addresses.Count() &&
                    results.Where(r => r.IsSuccessful).Count() > 0)
                {
                    return new DiagnosticsResult
                    {
                        IsDiagnosingSuccessful = true,
                        Code = GetSupportErrorCode(
                            ActionIds.ScaledOutStamp,
                            $"Working: {results.Where(r => r.IsSuccessful).Aggregate(string.Empty, (a, b) => string.Join(", ", a, b))}",
                            $"Not Working: {results.Where(r => !r.IsSuccessful).Aggregate(string.Empty, (a, b) => string.Join(", ", a, b))}",
                            functionApp),
                        SuccessResult = new DiagnoseSuccessResult
                        {
                            IsTerminating = true,
                            Message = "Your app is experiencing problems scaling out to multiple scale units.",
                            UserAction = "If the problem persists contact support",
                            ActionId = ActionIds.ScaledOutStamp
                        }
                    };
                }
            }
            return new DiagnosticsResult
            {
                IsDiagnosingSuccessful = true
            };
        }

        private async Task<DiagnosticsResult> CheckStorage(string connectionString, string connectionStringName)
        {
            if (string.IsNullOrEmpty(connectionString))
            {
                return new DiagnosticsResult
                {
                    IsDiagnosingSuccessful = true,
                    Code = GetSupportErrorCode(ActionIds.StorageAccountNullOrEmpty, connectionStringName),
                    SuccessResult = new DiagnoseSuccessResult
                    {
                        IsTerminating = true,
                        Message = string.Format("Azure Storage Account connection string stored in '{0}' is null or empty. This is required to have your function app working.", connectionStringName),
                        UserAction = "Update the app setting with a valid storage connection string.",
                        ActionId = ActionIds.StorageAccountNullOrEmpty
                    }
                };
            }

            var storageAccountName = connectionString
                .Split(';')
                .FirstOrDefault(e => e.StartsWith("AccountName", StringComparison.OrdinalIgnoreCase))
                ?.Split('=')
                ?.Last();

            if (string.IsNullOrEmpty(storageAccountName))
            {
                return new DiagnosticsResult
                {
                    IsDiagnosingSuccessful = true,
                    Code = GetSupportErrorCode(ActionIds.InvalidStorageConnectionString, connectionStringName),
                    SuccessResult = new DiagnoseSuccessResult
                    {
                        IsTerminating = true,
                        Message = "Please check the storage account connection string in application settings as it appears to be invalid.",
                        UserAction = "Update the app setting with a valid storage connection string.",
                        ActionId = ActionIds.InvalidStorageConnectionString
                    }
                };
            }

            var storageQueuesCName = $"{storageAccountName}.queue.core.windows.net";
            var storageBlobCName = $"{storageAccountName}.blob.core.windows.net";
            if (!await IsHostAvailable(storageBlobCName))
            {
                return new DiagnosticsResult
                {
                    IsDiagnosingSuccessful = true,
                    SuccessResult = new DiagnoseSuccessResult
                    {
                        IsTerminating = true,
                        Message = string.Format("Storage account {0} doesn't exist. Deleting the storage account the function app is using will cause the function app to stop working. ", storageAccountName),
                        UserAction = "Update the app setting with a valid existing storage connection string.",
                        ActionId = ActionIds.StorageAccountDoesNotExist
                    }
                };
            }

            if (!await IsHostAvailable(storageQueuesCName))
            {
                return new DiagnosticsResult
                {
                    IsDiagnosingSuccessful = true,
                    SuccessResult = new DiagnoseSuccessResult
                    {
                        IsTerminating = true,
                        Message = string.Format("Storage account {0} doesn't support Azure Queues Storage. Functions runtime require queues to work properly. Note that Premium storage accounts and blob only storage accounts don't support Azure Queue Storage.", storageAccountName),
                        UserAction = "Delete and recreate your function app with a storage account that supports Azure Queues Storage.",
                        ActionId = ActionIds.StorageAccountDoesntSupportQueues
                    }
                };
            }

            return new DiagnosticsResult
            {
                IsDiagnosingSuccessful = true
            };
        }

        private async Task<bool> IsHostAvailable(string domain)
        {
            try
            {
                var addresses = await Dns.GetHostAddressesAsync(domain);
                if (addresses.Any())
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
            catch
            {
                return false;
            }
        }

        private async Task<TypedPair<ArmResource<Dictionary<string, string>>>> CheckAppSettings(ArmResource<ArmFunctionApp> functionApp)
        {
            var armId = $"{functionApp.Id}/config/appsettings/list";
            var maybeAppSettings = await _client.Post<ArmResource<Dictionary<string, string>>>(armId, AntaresApiVersion);
            if (!maybeAppSettings.IsSuccessful)
            {
                return new TypedPair<ArmResource<Dictionary<string, string>>>(HandleArmResponseError(armId, maybeAppSettings.Error),null);
            }
            else
            {
                var appSettings = maybeAppSettings.Result;
                var diagResults = new List<DiagnosticsResult>();

                if (!appSettings.Properties.Any(k => k.Key.Equals(AzureWebJobsStorageAppSetting, StringComparison.OrdinalIgnoreCase)))
                {
                    diagResults.Add(new DiagnosticsResult
                    {
                        IsDiagnosingSuccessful = true,
                        SuccessResult = new DiagnoseSuccessResult
                        {
                            IsTerminating = true,
                            Message = string.Format("'{0}' application setting is missing from your app. This setting contains a connection string for an Azure Storage account that is needed for the functions runtime to handle multiple instances synchronization, log invocation results, and other infrastructure jobs. Your function app will not work correctly without that setting.", AzureWebJobsStorageAppSetting),
                            UserAction = "Create the app setting with a valid storage connection string.",
                            ActionId = ActionIds.MissingAzureWebjobsStorageAppSetting
                        }
                    });
                }

                if (!appSettings.Properties.Any(k => k.Key.Equals(AzureWebJobsDashboardAppSetting, StringComparison.OrdinalIgnoreCase)))
                {
                    diagResults.Add(new DiagnosticsResult
                    {
                        IsDiagnosingSuccessful = true,
                        SuccessResult = new DiagnoseSuccessResult
                        {
                            Message = string.Format("'{0}' application setting is missing from your app. This setting contains a connection string for an Azure Storage account that is needed for the monitoring view of your functions. This is where invocation data is aggregated and then displayed in monitoring view. Your monitoring view might be broken.", AzureWebJobsDashboardAppSetting),
                            UserAction = "Create the app setting with a valid storage connection string.",
                            ActionId = ActionIds.MissingAzureWebJobsDashboardAppSetting
                        }
                    });
                }

                if (!appSettings.Properties.Any(k => k.Key.Equals(FunctionsExtensionVersionAppSetting, StringComparison.OrdinalIgnoreCase)))
                {
                    diagResults.Add(new DiagnosticsResult
                    {
                        IsDiagnosingSuccessful = true,
                        SuccessResult = new DiagnoseSuccessResult
                        {
                            Message = string.Format("'{0}' application setting is missing from your app. Without this setting you'll always be running the latest version of the runtime even across major version updates which might contain breaking changes. It's advised to set that value to the current latest major version (~1) and you'll get notified with newer versions for update.", FunctionsExtensionVersionAppSetting),
                            UserAction = string.Format("Create the app setting and add a valid version. Latest current version is {0}", Constants.CurrentLatestRuntimeVersion),
                            ActionId = ActionIds.MissingFunctionsExtensionVersionAppSetting
                        }
                    });
                }

                if (functionApp.Properties.Sku.Equals("Dynamic", StringComparison.OrdinalIgnoreCase) &&
                    !appSettings.Properties.Any(k => k.Key.Equals(AzureFilesConnectionString, StringComparison.OrdinalIgnoreCase)))
                {
                    diagResults.Add(new DiagnosticsResult
                    {
                        IsDiagnosingSuccessful = true,
                        SuccessResult = new DiagnoseSuccessResult
                        {
                            IsTerminating = true,
                            Message = string.Format("'{0}' application setting is missing from your app. This setting contains a connection string for an Azure Storage account that is used to host your functions content. Your app will be completely broken without this setting.", AzureFilesConnectionString),
                            UserAction = "You may need to delete and recreate this function app if you no longer have access to the value of that application setting.",
                            ActionId = ActionIds.MissingAzureFilesConnectionString
                        }
                    });
                }

                if (functionApp.Properties.Sku.Equals("Dynamic", StringComparison.OrdinalIgnoreCase) &&
                    !appSettings.Properties.Any(k => k.Key.Equals(AzureFilesContentShare, StringComparison.OrdinalIgnoreCase)))
                {
                    diagResults.Add(new DiagnosticsResult
                    {
                        IsDiagnosingSuccessful = true,
                        SuccessResult = new DiagnoseSuccessResult
                        {
                            IsTerminating = true,
                            Message = string.Format("'{0}' application setting is missing from your app. This setting contains a share name where your function content lives. Your app will be completely broken without this setting.", AzureFilesContentShare),
                            UserAction = "You may need to delete and recreate this function app if you no longer have access to the value of that application setting.",
                            ActionId = ActionIds.MissingAzureFilesContentShare
                        }
                    });
                }

                return new TypedPair<ArmResource<Dictionary<string, string>>>(diagResults, appSettings);
            }
        }

        private async Task<TypedPair<ArmResource<ArmFunctionApp>>> CheckResource(string armId)
        {
            var maybeFunctionApp = await _client.Get<ArmResource<ArmFunctionApp>>(armId, AntaresApiVersion);

            if (!maybeFunctionApp.IsSuccessful)
            {
                return new TypedPair<ArmResource<ArmFunctionApp>>(HandleArmResponseError(armId, maybeFunctionApp.Error), null);
            }
            else
            {
                return CheckValidFunctionAppResource(maybeFunctionApp.Result);
            }
        }

        private TypedPair<ArmResource<ArmFunctionApp>> CheckValidFunctionAppResource(ArmResource<ArmFunctionApp> functionApp)
        {
            DiagnosticsResult result;
            if (!functionApp.Properties.Enabled ||
                !functionApp.Properties.AdminEnabled ||
                functionApp.Properties.SiteDisabledReason != 0 ||
                functionApp.Properties.SuspendedTill != null)
            {
                result = new DiagnosticsResult
                {
                    IsDiagnosingSuccessful = true,
                    Code = GetSupportErrorCode(ActionIds.FunctionAppIsStopped, functionApp),
                    SuccessResult = new DiagnoseSuccessResult
                    {
                        IsTerminating = true,
                        Message = "Your function app is disabled. It can be disabled because it ran out of quota or if your subscription is disabled.",
                        UserAction = "Understand why your application is suspended and try again after it is no longer suspended.",
                        ActionId = ActionIds.FunctionAppIsStopped
                    }
                };
            }
            else if (functionApp.Properties.State?.Equals("Running", StringComparison.OrdinalIgnoreCase) == false)
            {
                result = new DiagnosticsResult
                {
                    IsDiagnosingSuccessful = true,
                    Code = GetSupportErrorCode(ActionIds.FunctionAppIsStopped, functionApp),
                    SuccessResult = new DiagnoseSuccessResult
                    {
                        IsTerminating = true,
                        Message = "Your function app stopped.",
                        UserAction = "You have to start your function app for the portal UX to work properly.",
                        ActionId = ActionIds.FunctionAppIsStopped
                    }
                };
            }
            else if (functionApp.Properties.ClientCertEnabled)
            {
                result = new DiagnosticsResult
                {
                    IsDiagnosingSuccessful = true,
                    Code = GetSupportErrorCode(ActionIds.AppIsMisconfiguredInAzure, functionApp),
                    SuccessResult = new DiagnoseSuccessResult
                    {
                        IsTerminating = true,
                        Message = "Your function app has client certificate authentication enabled. This causes the UI to not work for function runtime scenarios (running, checking for runtime errors, access keys, etc).",
                        UserAction = "You should still be able to manage your functions. If you want the runtime to work, consider disabling client certificate on the app.",
                        ActionId = ActionIds.AppIsMisconfiguredInAzure
                    }
                };
            }
            else if (functionApp.Properties.HostNameSslStates == null ||
                functionApp.Properties.HostNameSslStates.Count() < 2 ||
                !functionApp.Properties.HostNameSslStates.Any(h => h.HostType == 1) ||
                !functionApp.Properties.HostNameSslStates.Any(h => h.HostType == 0) ||
                string.IsNullOrEmpty(functionApp.Properties.DefaultHostName))
            {
                result = new DiagnosticsResult
                {
                    IsDiagnosingSuccessful = true,
                    Code = GetSupportErrorCode(ActionIds.AppIsMisconfiguredInAzure, functionApp),
                    SuccessResult = new DiagnoseSuccessResult
                    {
                        IsTerminating = true,
                        Message = "Your function app appears to not have been created successfully.",
                        UserAction = "You can either try deleting and re-creating the function app or contact support.",
                        ActionId = ActionIds.AppIsMisconfiguredInAzure
                    }
                };
            }
            else
            {
                result = new DiagnosticsResult
                {
                    IsDiagnosingSuccessful = true
                };
            }

            return new TypedPair<ArmResource<ArmFunctionApp>>(result, functionApp);
        }

        private DiagnosticsResult HandleArmResponseError(string armId, HttpResponseMessage response)
        {
            switch (response.StatusCode)
            {
                case HttpStatusCode.Forbidden:
                case HttpStatusCode.Unauthorized:
                    return new DiagnosticsResult
                    {
                        IsDiagnosingSuccessful = false,
                        Code = GetSupportErrorCode(armId, ErrorIds.CannotAccessFunctionAppArmResource, response),
                        ErrorResult = new DiagnoseErrorResult
                        {
                            ErrorMessage = "We are not able to access your Azure settings for your function app.",
                            ErrorId = ErrorIds.CannotAccessFunctionAppArmResource,
                            ErrorAction = string.Format("First make sure you have proper access to the Azure resource {0}. If you still see this error try refreshing the portal to renew your authentication token.", armId)
                        }
                    };
                case HttpStatusCode.InternalServerError:
                case HttpStatusCode.GatewayTimeout:
                case HttpStatusCode.ServiceUnavailable:
                    return new DiagnosticsResult
                    {
                        IsDiagnosingSuccessful = false,
                        Code = GetSupportErrorCode(armId, ErrorIds.UnexpectedArmError, response),
                        ErrorResult = new DiagnoseErrorResult
                        {
                            ErrorMessage = "There seem to be a problem querying Azure backend for your function app.",
                            ErrorId = ErrorIds.UnexpectedArmError
                        }
                    };
                default:
                    return new DiagnosticsResult
                    {
                        IsDiagnosingSuccessful = false,
                        Code = GetSupportErrorCode(armId, ErrorIds.UnexpectedArmError, response),
                        ErrorResult = new DiagnoseErrorResult
                        {
                            ErrorMessage = "There seem to be a problem querying Azure backend for your function app.",
                            ErrorId = ErrorIds.UnknownErrorCallingArm,
                        }
                    };
            }
        }

        private string GetSupportErrorCode(params object[] items)
        {
            var obj = new JObject();
            for (var i = 0; i < items.Length; i++)
            {
                if (items[i] != null)
                {
                    obj[$"item{i}"] = JToken.FromObject(items[i]);
                }
            }
            obj["timestamp"] = DateTimeOffset.UtcNow;
            obj["portal_instance"] = Environment.GetEnvironmentVariable("WEBSITE_SITE_NAME");
            var str = JsonConvert.SerializeObject(obj);
            return Convert.ToBase64String(Encoding.UTF8.GetBytes(str));
        }
    }

    class TypedPair<T>
    {
        public IEnumerable<DiagnosticsResult> DiagnosticsResults { get; private set; }
        public T Data { get; private set; }

        public TypedPair(IEnumerable<DiagnosticsResult> results, T data)
        {
            Data = data;
            DiagnosticsResults = results;
        }

        public TypedPair(DiagnosticsResult result, T data)
        {
            Data = data;
            DiagnosticsResults = new[] { result };
        }
    }
}