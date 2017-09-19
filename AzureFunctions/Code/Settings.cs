﻿using AzureFunctions.Contracts;
using AzureFunctions.Models;
using Newtonsoft.Json;
using System;
using System.Configuration;
using System.IO;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using System.Web.Hosting;

namespace AzureFunctions.Code
{
    public class Settings : ISettings
    {
        private ClientConfiguration _clientConfig = null;

        public Settings()
        {
            _clientConfig = new ClientConfiguration()
            {
                RuntimeType = this.RuntimeType.ToString(),
                AzureResourceManagerEndpoint = this.AzureResourceManagerEndpoint
            };
        }

        private static string config(string @default = null, [CallerMemberName] string key = null)
        {
            var value = System.Environment.GetEnvironmentVariable(key) ?? ConfigurationManager.AppSettings[key];
            return string.IsNullOrEmpty(value)
                ? @default
                : value;
        }

        public async Task<string> GetCurrentSiteExtensionVersion()
        {
            try
            {
                using (var stream = new StreamReader(Path.Combine(AppDataPath, "version.txt")))
                {
                    return await stream.ReadToEndAsync();
                }
            }
            catch { }
            return string.Empty;
        }

        public ClientConfiguration GetClientConfiguration()
        {
            return _clientConfig;
        }

        public string GetConfigServiceObject()
        {
            return JsonConvert.SerializeObject(new
            {
                env = new
                {
                    hostName = Environment.GetEnvironmentVariable("WEBSITE_HOSTNAME"),
                    runtimeType = _clientConfig.RuntimeType,
                    azureResourceManagerEndpoint = _clientConfig.AzureResourceManagerEndpoint
                },
                functionsVersionInfo = new
                {
                    runtimeStable = new[] { "~1", "beta", "latest" },
                    proxyStable = new[] { "~0.3", "latest" },
                    runtimeDefault = "~1",
                    proxyDefault = "~0.3"
                }
            });
        }

        public string AppDataPath => Path.Combine(HostingEnvironment.ApplicationPhysicalPath, "App_Data");
        public string TemplatesPath => Path.Combine(AppDataPath, "Templates");
        public string ResourcesPortalPath => Path.Combine(HostingEnvironment.ApplicationPhysicalPath, "ResourcesPortal");


        public string LoggingSqlServerConnectionString => config();

        public bool LogToSql => bool.Parse(config(false.ToString()));

        public bool LogToFile => bool.Parse(config(false.ToString()));

        public bool LogLoggingDebugInfo => bool.Parse(config(false.ToString()));

        public string AzureResourceManagerEndpoint => config();

        public string ManagementResource => config();

        public RuntimeType RuntimeType => (RuntimeType)Enum.Parse(typeof(RuntimeType), config());
    }
}