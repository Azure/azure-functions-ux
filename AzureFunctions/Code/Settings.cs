﻿using AzureFunctions.Contracts;
using AzureFunctions.Models;
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

        public string AppDataPath => Path.Combine(HostingEnvironment.ApplicationPhysicalPath, "App_Data");
        public string TemplatesPath => Path.Combine(AppDataPath, "Templates");
        public string ResourcesPortalPath => Path.Combine(HostingEnvironment.ApplicationPhysicalPath, "ResourcesPortal");


        public string LoggingSqlServerConnectionString => config();

        public bool LogToSql => bool.Parse(config(false.ToString()));

        public bool LogToFile => bool.Parse(config(false.ToString()));

        public bool LogLoggingDebugInfo => bool.Parse(config(false.ToString()));

        public string AzureResourceManagerEndpoint => config();

        public string ManagementResource => config();
    }
}