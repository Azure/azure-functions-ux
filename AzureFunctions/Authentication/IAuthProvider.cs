using System.Web;

namespace AzureFunctions.Authentication
{
    public interface IAuthProvider
    {
        bool TryAuthenticateRequest(HttpContextBase context);
        void PutOnCorrectTenant(HttpContextBase context);
        string GetLoginUrl(HttpContextBase context);
    }
}
