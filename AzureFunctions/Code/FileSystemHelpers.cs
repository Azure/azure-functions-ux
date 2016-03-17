using System.IO;
using System.Threading.Tasks;

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