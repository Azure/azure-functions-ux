using System.Net.Http;
using System.Threading.Tasks;
using AzureFunctions.Models;

namespace AzureFunctions.Contracts
{
    public interface IPassThroughRequestManager
    {
        Task<HttpResponseMessage> HandleRequest(RequestObject clientRequest);
    }
}
