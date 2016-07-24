using System.Threading.Tasks;

namespace AzureFunctions.Contracts
{
    public interface ISettings
    {
        Task<string> GetCurrentSiteExtensionVersion();
        string AppDataPath { get; }
        string TemplatesPath { get; }
        string ResourcesPortalPath { get; }
        string LoggingSqlServerConnectionString { get; }
        bool LogToSql { get; }
        bool LogToFile { get; }
        bool LogLoggingDebugInfo { get; }
    }
}