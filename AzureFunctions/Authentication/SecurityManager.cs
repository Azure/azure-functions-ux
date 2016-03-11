using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace AzureFunctions.Authentication
{
    public static class SecurityManager
    {
        private static readonly IAuthProvider _frontEndAuthProvider;
        private static readonly IAuthProvider _localhostAuthProvider;

        static SecurityManager()
        {
            _frontEndAuthProvider = new FrontEndAuthProvider();
            _localhostAuthProvider = new LocalhostAuthProvider();
        }

        private static IAuthProvider GetAuthProvider(HttpContextBase context)
        {
            return context.Request.Url.IsLoopback
                ? _localhostAuthProvider
                : _frontEndAuthProvider;
        }

        public static bool TryAuthenticateRequest(HttpContextBase context)
        {
            return GetAuthProvider(context).TryAuthenticateRequest(context);
        }

        public static void PutOnCorrectTenant(HttpContextBase context)
        {
            GetAuthProvider(context).PutOnCorrectTenant(context);
        }

        public static string GetLoginUrl(HttpContextBase context)
        {
            return GetAuthProvider(context).GetLoginUrl(context);
        }
    }
}