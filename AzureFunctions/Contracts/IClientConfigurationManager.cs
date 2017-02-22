using AzureFunctions.Models;

namespace AzureFunctions.Contracts
{
    public interface IClientConfigurationManager
    {
        ClientConfiguration GetClientConfiguration();
    }
}
