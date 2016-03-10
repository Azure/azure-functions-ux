using System.Web;

namespace AzureFunctions.Authentication
{
    public interface IAuthProvider
    {
        void AuthenticateRequest(HttpContextBase context);
        void PutOnCorrectTenant(HttpContextBase context);
    }
}
