using System.Security.Principal;

namespace AzureFunctions.Authentication
{
    public class AzureFunctionsPrincipal : IPrincipal 
    {
        public AzureFunctionsPrincipal(IIdentity identity)
        {
            this.Identity = identity;
        }

        public bool IsInRole(string role)
        {
            return true;
        }

        public IIdentity Identity { get; private set; }
    }
}