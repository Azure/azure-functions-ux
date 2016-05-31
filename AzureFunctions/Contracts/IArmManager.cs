using System.Threading.Tasks;

namespace AzureFunctions.Contracts
{
    public interface IArmManager
    {
        Task CreateTrialFunctionContainer();
        Task GetTrialTime();
        Task ExtendTrialTime();
    }
}