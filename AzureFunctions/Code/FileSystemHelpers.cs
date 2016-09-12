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

        public static string ReadAllTextFromFile(string path)
        {
            return File.ReadAllText(path);
        }

        public static bool FileExists(string path)
        {
            return File.Exists(path);
        }
    }
}