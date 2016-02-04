using AzureFunctions.Common;
using AzureFunctions.Contracts;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

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
        public string AppDataPath { get; } = @"D:\home\site\wwwroot\App_Data";
    }
}