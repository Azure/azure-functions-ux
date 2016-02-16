using AzureFunctions.Common;
using AzureFunctions.Contracts;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Hosting;

namespace AzureFunctions.Code
{
    public class Settings : ISettings
    {
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
        public string AppDataPath { get; } = Path.Combine(HostingEnvironment.ApplicationPhysicalPath, "App_Data");
    }
}