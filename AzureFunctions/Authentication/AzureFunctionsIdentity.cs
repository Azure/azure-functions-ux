using AzureFunctions.Common;
using System;
using System.Security.Principal;

namespace AzureFunctions.Authentication
{
    public class AzureFunctionsIdentity : IIdentity
    {
        public AzureFunctionsIdentity(string email)
        {
            if (string.IsNullOrEmpty(email))
            {
                throw new ArgumentNullException(nameof(email));
            }

            this.Name = email;
            this.AuthenticationType = "Functions";
        }

        public string AuthenticationType { get; private set; }

        public virtual bool IsAuthenticated
        {
            get
            {
                return !this.Name.Equals(Constants.AnonymousUserName, StringComparison.OrdinalIgnoreCase);
            }
        }

        public bool IsPortal
        {
            get
            {
                return this.Name.Equals(Constants.PortalAnonymousUser, StringComparison.OrdinalIgnoreCase);
            }
        }

        public string Name { get; private set; }
    }
}