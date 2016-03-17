using AzureFunctions.Models;
using AzureFunctions.Models.ArmResources;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AzureFunctions.Contracts
{
    public interface IArmManager
    {
        Task CreateTrialFunctionContainer();
    }
}