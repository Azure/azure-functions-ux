using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace AzureFunctions.Code
{
    public static class FileSystemHelpers
    {
        public static async Task<string> ReadAllTextFromFileAsync(string path)
        {
            using (var streamReader = new StreamReader(File.OpenRead(path)))
            {
                return await streamReader.ReadToEndAsync();
            }
        }

        public static bool FileExists(string path)
        {
            return File.Exists(path);
        }
    }
}