using AzureFunctions.Models;
using AzureFunctions.Models.ArmResources;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AzureFunctions.Contracts
{
    public interface IArmManager
    {
        Task CreateTrialFunctionContainer();
        Task<FunctionContainer> GetFunctionContainer();
        Task<FunctionContainer> CreateFunctionContainer(ResourceGroup resourceGroup, string serverFarmId);
        Task<FunctionContainer> CreateFunctionContainer(string subscriptionId, string location, string serverFarmId);
        Task<IEnumerable<Subscription>> GetSubscriptions();
        Task<IEnumerable<ServerFarm>> GetServerFarms();
    }
}