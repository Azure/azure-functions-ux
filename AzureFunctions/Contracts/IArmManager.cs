using System.Net.Http;
using System.Threading.Tasks;
using AzureFunctions.Models;

namespace AzureFunctions.Contracts
{
    public interface IArmManager
    {
        Task<UIResource> CreateTrialFunctionsResource();
        Task<UIResource> GetTrialFunctionsResource();
        Task<UIResource> ExtendTrialFunctionsResource();
    }
}