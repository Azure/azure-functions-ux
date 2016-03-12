using AzureFunctions.Models;
using AzureFunctions.Models.ArmResources;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AzureFunctions.Contracts
{
    public interface IArmManager
    {
        Task<IEnumerable<Subscription>> ListSubscriptionsAsync();
        Task<IEnumerable<FunctionsContainer>> ListFunctionContainersAsync(string subscription);
        Task<FunctionsContainer> CreateFunctionContainerAsync(string subscriptionId, string geoRegion);




        Task CreateTrialFunctionContainer();


        Task<FunctionsContainer> GetFunctionContainer(string functionContainerId);
        Task<FunctionsContainer> CreateFunctionContainer(ResourceGroup resourceGroup, string serverFarmId);
        Task<FunctionsContainer> CreateFunctionContainer(string subscriptionId, string location, string serverFarmId);
    }
}