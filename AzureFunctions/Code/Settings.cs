using AzureFunctions.Common;
using AzureFunctions.Contracts;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;

namespace AzureFunctions.Code
{
    public class Settings : ISettings
    {
        public string CurrentSiteExtensionVersion { get; private set; }
        public string AppDataPath { get; } = @"D:\home\site\wwwroot\App_Data";

        private void EnsureProperties()
        {
            try
            {
                using (var stream = new StreamReader(Path.Combine(AppDataPath, "version.txt")))
                {
                    CurrentSiteExtensionVersion = stream.ReadToEnd();
                }
            }
            catch { }
        }

        public Settings()
        {
            EnsureProperties();
        }
    }
}