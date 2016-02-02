using AzureFunctions.Models;
using System.Threading.Tasks;

namespace AzureFunctions.Contracts
{
    public interface IArmManager
    {
        Task<FunctionContainer> GetFunctionContainer();
    }
}