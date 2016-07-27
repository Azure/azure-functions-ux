using System;
using System.Net.Http;
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

        public static void HandleTryAppServiceResponse(HttpContextBase context)
        {
            if (context.Request.RawUrl.StartsWith("/try") && context.Request.Params["cookie"] != null)
            {

                var tryAppServiceToken = context.Request.Params["cookie"];
                var state = context.Request.Params["state"];
                var uri = new Uri(state);
                var querystring = uri.ParseQueryString();
                context.Response.SetCookie(new HttpCookie("TryAppServiceToken", tryAppServiceToken));
                context.Response.SetCookie(new HttpCookie("templateId", querystring["templateId"]));
                context.Response.SetCookie(new HttpCookie("provider", querystring["provider"]));
                context.Response.SetCookie(new HttpCookie("functionName", querystring["functionName"]));
                context.Response.RedirectLocation = "/try";
                context.Response.StatusCode = 302;
                context.Response.End();
            }
        }
    }
}