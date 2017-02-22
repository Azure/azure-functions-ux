using AzureFunctions.Contracts;
using AzureFunctions.Models;
using System.Configuration;

namespace AzureFunctions.Code
{
    public class ClientConfigurationManager : IClientConfigurationManager
    {
        private ClientConfiguration _clientConfig = null;

        public ClientConfigurationManager()
        {
            _clientConfig = new ClientConfiguration()
            {
                AzureResourceManagerEndpoint = ConfigurationManager.AppSettings["AzureResourceManagerEndpoint"]
            };
        }

        public ClientConfiguration GetClientConfiguration()
        {
            return _clientConfig;
        }
    }
}