using System.Net.Http;
using System.Threading.Tasks;

namespace AzureFunctions.Contracts
{
    public interface IArmManager
    {
        Task<HttpResponseMessage> CreateTrialFunctionsResource();
        Task<HttpResponseMessage> GetTrialFunctionsResource();
        Task<HttpResponseMessage> ExtendTrialFunctionsResource();
    }
}