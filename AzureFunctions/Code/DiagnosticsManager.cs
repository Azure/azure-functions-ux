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

        /// <summary>
        /// This is the only method exposed on an IDiagnosticsManager for now.
        /// This method does all the diagnosing in a logical order.
        ///     1. Check the ARM state of the function app
        ///     2. Check App Settings for the function app
        ///     3. Check Storage Account linked to the function app.
        ///           Functions apps require a storage account that people have been known to either delete
        ///           or misconfigure. This checks for all the known misconfigurations people run into.
        ///     4. Check the master key.
        ///           This is created by Kudu or the runtime; however it seems to be very common for people
        ///           to get in a state where the encryption keys can't decrypt that key, and the apps are in
        ///           a completely broken state until this is corrected.
        ///     5. Check cross stamp issues.
        ///           This is another very common issue where after scaling to a non-home stamp, the scaled site
        ///           doesn't work on the non-home stamp and it's very hard to get what is going on there.
        ///     6. Check runtime errors.
        ///           This will probably need to be expanded as we only look for some general markers now, but we
        ///           can do more heuristics to figure out what's wrong with the runtime.
        /// <param name="armId">A full ARM Id for a FunctionApp to be diagnosed for any issues.</param>
        /// </summary>
        public async Task<IEnumerable<DiagnosticsResult>> Diagnose(string armId)
        {
            // These are generic methods for checking a DiagnosticsResult object.
            // If they return true, that means we need to abort the diagnostic session as we found an error.
            // That error could be an error in the process itself. This is when `IsDiagnosingSuccessful == false`
            // or that we found a fatal error, this is when `SuccessResult.IsTerminating == true`
            // checkReturns is just the same but over an IEnumerable of DiagnosticsResult
            Func<DiagnosticsResult, bool> checkReturn = r => !r.IsDiagnosingSuccessful || r.SuccessResult.IsTerminating;
            Func<IEnumerable<DiagnosticsResult>, bool> checkReturns = r => r.Any(checkReturn);

            // Start by checking the ARM state of the function app.
            // This doesn't actually check app settings, but rather just the ARM object exists
            // and that the function app isn't disabled, stopped, over quota, misconfigured in Antares for
            // any random reason like I have sometimes seen with sites missing random hostnames, or half created etc.
            var resourceCheckResult = await CheckResource(armId);
            if (checkReturns(resourceCheckResult.DiagnosticsResults))
            {
                return resourceCheckResult.DiagnosticsResults;
            }

            // This means the ARM resource is all good. Let's grab the returned functionApp object because others will use it.
            var functionApp = resourceCheckResult.Data;

            // Check app settings
            var appSettingsCheckResult = await CheckAppSettings(functionApp);
            if (checkReturns(appSettingsCheckResult.DiagnosticsResults))
            {
                // Every time we return the result we add it to all the previous results we got.
                // This way we can still display non-terminating errors that we've already diagnosed.
                // TODO: Maybe we should be filtering these results here as opposed to in the controller
                // as we will be returning a bunch of empty results to all the callers. I can probably add
                // an extension method for this cleanup.
                return resourceCheckResult.DiagnosticsResults
                        .Concat(appSettingsCheckResult.DiagnosticsResults);
            }

            // Check storage account state.
            var storageCheckResult = await CheckStorage(appSettingsCheckResult.Data.Properties[AzureWebJobsStorageAppSetting], AzureWebJobsStorageAppSetting);
            if (checkReturn(storageCheckResult))
            {
                return resourceCheckResult.DiagnosticsResults
                        .Concat(appSettingsCheckResult.DiagnosticsResults)
                        .Concat(new[] { storageCheckResult });
            }

            // Check the master key
            var masterKeyResult = await CheckMasterKey(functionApp);
            if (checkReturns(masterKeyResult.DiagnosticsResults))
            {
                return resourceCheckResult.DiagnosticsResults
                        .Concat(appSettingsCheckResult.DiagnosticsResults)
                        .Concat(new[] { storageCheckResult })
                        .Concat(masterKeyResult.DiagnosticsResults);
            }

            // check if it's some cross stamp issue
            var checkCrossStampResult = await CheckCrossStampResult(functionApp, masterKeyResult.Data);
            if (checkReturn(checkCrossStampResult))
            {
                return resourceCheckResult.DiagnosticsResults
                        .Concat(appSettingsCheckResult.DiagnosticsResults)
                        .Concat(new[] { storageCheckResult })
                        .Concat(masterKeyResult.DiagnosticsResults)
                        .Concat(new[] { checkCrossStampResult });
            }

            // Check runtime state.
            var checkFunctionRuntimeResult = await CheckFunctionRuntimeResult(functionApp, masterKeyResult.Data);

            // No need to call checkReturn here since it's the last check anyway.
            return resourceCheckResult.DiagnosticsResults
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

        /// <summary>
        /// The master key is created by Kudu or the runtime; however it seems to be very common for people
        /// to get in a state where the encryption keys can't decrypt that key, and the apps are in
        /// a completely broken state until this is corrected.
        /// <param name="functionApp"> the function app object to check the master key for </param>
        /// </summary>
        private async Task<TypedPair<string>> CheckMasterKey(ArmResource<ArmFunctionApp> functionApp)
        {
            // Get kudu's url from the function app.
            // Though this might throw due to various oddities that happen in Antares every now and then,
            // the check for the existence of correct numbers of hostNames is taken care of in the CheckResource()
            // method, which should be called before this one.
            var scmUrl = functionApp.Properties.HostNameSslStates.First(h => h.HostType == 1).Name;
            var masterKeyResult = await _client.Get<MasterKey>(new Uri($"https://{scmUrl}/api/functions/admin/masterkey"));
            DiagnosticsResult result;
            if (masterKeyResult.IsSuccessful)
            {
                // Nothing to do here. The look up was successful, so return a successful diagnose with no user action
                // and also return the master key.
                return new TypedPair<string>(new DiagnosticsResult { IsDiagnosingSuccessful = true }, masterKeyResult.Result.Key);
            }
            else if (masterKeyResult.Error.StatusCode == HttpStatusCode.InternalServerError)
            {
                // This is most probably the crypto issue.
                // However to be sure, check the content for a WebApiException that says so.
                var content = await masterKeyResult.Error.Content.ReadAsAsync<WebApiException>();
                if (!string.IsNullOrEmpty(content.ExceptionType) &&
                    content.ExceptionType.Equals("System.Security.Cryptography.CryptographicException", StringComparison.OrdinalIgnoreCase))
                {
                    // Yep it's the crypto error, build the correct DiagnosticsResult object
                    result = new DiagnosticsResult
                    {
                        IsDiagnosingSuccessful = true,
                        Code = GetSupportErrorCode(ActionIds.KeysUnexpectedError, content, masterKeyResult.Error, functionApp),
                        SuccessResult = new DiagnoseSuccessResult
                        {
                            // This is a terminating error. This is almost exactly why this user is seeing errors in the portal.
                            IsTerminating = true,
                            Message = "We are unable to decrypt your function access keys. This can happen if you delete and recreate the app with the same name, or if you copied your keys from a different function app.",
                            UserAction = "Follow steps here https://go.microsoft.com/fwlink/?linkid=844094",
                            ActionId = ActionIds.KeysUnexpectedError
                        }
                    };
                }
                else
                {
                    // Though it's a 500, it's not the crypto error. I don't know of any other reason this API might return 500
                    // but handle that nonetheless.
                    result = new DiagnosticsResult
                    {
                        IsDiagnosingSuccessful = true,
                        Code = GetSupportErrorCode(ActionIds.KeysUnexpectedError, content, masterKeyResult.Error, functionApp),
                        SuccessResult = new DiagnoseSuccessResult
                        {
                            // Even though we don't know what's going on, we still mark it as terminating because we can't get
                            // the masterkey still.
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
                // It didn't fail with 500, but nonetheless it failed for some other reason.
                // At the moment I'm not aware of any other reason, but handle it anyway.
                result = new DiagnosticsResult
                {
                    IsDiagnosingSuccessful = true,
                    Code = GetSupportErrorCode(ActionIds.KeysUnexpectedError, masterKeyResult.Error, functionApp),
                    SuccessResult = new DiagnoseSuccessResult
                    {
                        // Ditto. Can't get the masterKey, so it has to be terminating.
                        IsTerminating = true,
                        Message = "We are unable to access your function keys.",
                        UserAction = "If the error persists, please contact support.",
                        ActionId = ActionIds.KeysUnexpectedError
                    }
                };
            }

            return new TypedPair<string>(result, null);
        }

        /// <summary>
        /// This is another very common issue where after scaling to a non-home stamp, the scaled site
        /// doesn't work on the non-home stamp and it's very hard to get what is going on there.
        /// To figure out this issue, we need to DNS resolve the host and get all addresses, then 
        /// then send a status request to all of them. 
        /// <param name="functionApp"> The function app to be checked for cross stamp issues. </param>
        /// <param name="masterKey"> The masterKey for the function app to be diagnosed. </param>
        /// </summary>
        private async Task<DiagnosticsResult> CheckCrossStampResult(ArmResource<ArmFunctionApp> functionApp, string masterKey)
        {
            // Use the defaultHostName, this is `<appName>.azurewebsites.net`
            var hostName = functionApp.Properties.DefaultHostName;
            // This method returns a list of all the IP addresses for a given domain.
            var addresses = await Dns.GetHostAddressesAsync(hostName);

            if (addresses.Count() == 0)
            {
                // This could be some negative cache issue.
                // While technically not a cross stamp issue, we can know what's going on.
                // This is however tricky since the negative cache in this scenario is on the backend not the client.
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
                // This means the app is indeed scaled to more than 1 stamp.
                var headers = new Dictionary<string, string>
                {
                    { "HOST", hostName },
                    { "x-functions-key", masterKey }
                };

                var results = await addresses
                    .Select(ip => ip.ToString())
                    // BUG: need to add a HOST header.
                    .Select(ip => _client.Get<string>(new Uri($"https://{ip}/"), headers))
                    .WhenAll();
                if (results.Where(r => r.IsSuccessful).Count() != addresses.Count() &&
                    results.Where(r => r.IsSuccessful).Count() > 0)
                {
                    // If not all succeeded, but some did succeeded
                    // I realize it's an odd condition that ignores the case of all failed.
                    // But this is important not to send investigation down a wrong path.
                    // Here we're only looking for some success and some failures. Someone else will take care of all failures
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

        /// <summary>
        /// Functions apps require a storage account that people have been known to either delete or misconfigure.
        /// This method checks for the following cases (which I have seen actually happen):
        ///     1. Wrong connection string.
        ///     2. Deleted storage account.
        ///     3. Wrong type of storage account.
        ///         There "blob only" storage accounts and "premium" storage accounts.
        ///         While "blob only" means exactly that, "premium" is also blob only, and even only a specific type of blobs.
        ///         "premium" is Page Blob only, i.e: VHDs, not Block Blobs, i.e: normal files.
        ///         Due to the wonderfully clear naming, people always try to use premium storage which doesn't work
        ///         since the runtime requires a full storage account with access to block blobs and queues.
        /// <param name="connectionString"> connection string to check the storage account of. </param>
        /// <param name="connectionStringName"> the name of that connection string. This is used for a nice error message. </param>
        /// </summary>
        private async Task<DiagnosticsResult> CheckStorage(string connectionString, string connectionStringName)
        {
            if (string.IsNullOrEmpty(connectionString))
            {
                // This shouldn't really happen since the CheckAppSettings() method is supposed to be
                // called before this one and it should ensure that we don't have empty connection strings
                // but just check it again for completeness of this method.
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

            // Parse storage account connection string.
            // It looks something like:
            //     DefaultEndpointsProtocol=https;AccountName=<Name>;AccountKey=<Key>
            var storageAccountName = connectionString
                .Split(';') // [ "DefaultEndpointsProtocol=https", "AccountName=<Name>", "AccountKey=<Key>" ]
                .FirstOrDefault(e => e.StartsWith("AccountName", StringComparison.OrdinalIgnoreCase)) // "AccountName=<Name>"
                ?.Split('=') // [ "AccountName", "<Name>" ]
                ?.Last(); // "<Name>"

            // If the parsing above fails for any reason, that means the connection string is not configured correctly.
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

            // Build the DNS records for the queues and blob endpoints of the storage account.
            var storageQueuesCName = $"{storageAccountName}.queue.core.windows.net";
            var storageBlobCName = $"{storageAccountName}.blob.core.windows.net";

            // Check that the blob endpoint is available.
            // This acts as "is storage account deleted" check.
            // Note that we're not ensuring that the key actually works.
            // We haven't seen issues where people renewed their keys without fixing the app setting.
            // Though it's possible, so maybe will need to add that in the future.
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

            // Now check the queues endpoint to check if the account is "premium" or blob only.
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

            // Nothing is wrong with storage.
            return new DiagnosticsResult
            {
                IsDiagnosingSuccessful = true
            };
        }

        /// <summary>
        /// This just does a DNS resolution to determine if the host is available or not.
        /// This could be wrong due to negative cache, not cleaning up a deleted resource domain, etc.
        /// But it's a good and quick way to check for now.
        /// <param name="domain"> domain or host to be checked. </param>
        /// </summary>
        private async Task<bool> IsHostAvailable(string domain)
        {
            try
            {
                // GetHostAddressesAsync throws:
                //      ArgumentNullException
                //      ArgumentOutOfRangeException
                //      ArgumentException
                //      SocketException
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

        /// <summary>
        /// If an app setting goes missing for any reason, make sure to alert the user regarding it.
        /// The method isn't really very smart since every app setting has a different message and a different action, etc.
        /// I didn't wanna complicate the logic too much for 4 app settings.
        /// <param name="functionApp"> function app to check the app settings for. </param>
        /// </summary>
        private async Task<TypedPair<ArmResource<Dictionary<string, string>>>> CheckAppSettings(ArmResource<ArmFunctionApp> functionApp)
        {
            var armId = $"{functionApp.Id}/config/appsettings/list";
            // Dictionary<string, string> is all we need from app settings.
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

        /// <summary>
        /// this method returns:
        ///     {
        ///         "item0": <serialized object[0]>,
        ///         "item1": <serialized object[1]>,
        ///         ....,
        ///         "itemN": <serialized object[N]>,
        ///         "timestamp": <currentTime>,
        ///         "portal_instance": <functions-bay | functions-blu | functions-db3 | functions-hk1>
        ///     }
        /// in a string that is encrypted and base64 (I haven't added the encryption below yet.)
        /// This is meant to be only decrypt-able by us and support since it contains user information and they might share it
        /// on forums or StackOverflow. (almost guaranteed > 140 characters.)
        /// </summary>
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

    /// <summary>
    /// TypedPair really is just a Tuple<IEnumerable<DiagnosticsResult>, T>
    /// The only reason is because of the ugliness of:
    ///   Tuple<IEnumerable<DiagnosticsResult>, T>  vs  TypedPair<T>
    /// Though obviously it still ugly. Hopefully will come back and clean this a bit once C#7 is out.
    /// </summary>
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