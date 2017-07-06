using AzureFunctions.Models;
using System.Threading.Tasks;

namespace AzureFunctions.Contracts
{
    public interface ISettings
    {
        ClientConfiguration GetClientConfiguration();
        Task<string> GetCurrentSiteExtensionVersion();
        string AppDataPath { get; }
        string TemplatesPath { get; }
        string ResourcesPortalPath { get; }
        string LoggingSqlServerConnectionString { get; }
        string AzureResourceManagerEndpoint { get; }
        string ManagementResource { get; }
        bool LogToSql { get; }
        bool LogToFile { get; }
        bool LogLoggingDebugInfo { get; }
        RuntimeType RuntimeType { get; }
    }

    public enum RuntimeType
    {
        Azure,
        OnPrem,
        Standalone
    }
}