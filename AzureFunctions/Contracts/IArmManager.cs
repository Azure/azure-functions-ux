using AzureFunctions.Models;
using AzureFunctions.Models.ArmResources;
using System.Threading.Tasks;

namespace AzureFunctions.Contracts
{
    public interface IArmManager
    {
        Task<FunctionContainer> GetFunctionContainer();
        Task<FunctionContainer> CreateFunctionContainer(ResourceGroup resourceGroup);
        Task<FunctionContainer> CreateFunctionContainer(string subscriptionId, string location);
    }
}