using AzureFunctions.Code;
using AzureFunctions.Contracts;
using System;
using System.Net.Http;
using System.Web;

namespace AzureFunctions.Authentication
{
    public static class SecurityManager
    {
        private static readonly ISettings _settings;
        private static readonly IAuthProvider _frontEndAuthProvider;
        private static readonly IAuthProvider _localhostAuthProvider;

        static SecurityManager()
        {
            _settings = new Settings();
            _frontEndAuthProvider = new FrontEndAuthProvider(_settings);
            _localhostAuthProvider = new LocalhostAuthProvider(_settings);
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
            // Try scenario's used to require a /try path but we changed it to a query string instead.
            if (context.Request.RawUrl.StartsWith("/try") && HttpUtility.ParseQueryString(context.Request.Url.Query)["trial"] != "true")
            {
                context.Response.RedirectLocation = "/?trial=true";
                context.Response.StatusCode = 302;
                context.Response.End();
            }
            else if (context.Request.Params["cookie"] != null)
            {
                var state = context.Request.Params["state"];

                if (!string.IsNullOrEmpty(state)
                    && String.Equals(HttpUtility.ParseQueryString(state)["trial"], "true", StringComparison.OrdinalIgnoreCase))
                {
                    var tryAppServiceToken = context.Request.Params["cookie"];
                    var uri = new Uri(state);
                    var querystring = uri.ParseQueryString();
                    context.Response.SetCookie(SetCookieExpiry(new HttpCookie("TryAppServiceToken", tryAppServiceToken)));
                    context.Response.SetCookie(SetCookieExpiry(new HttpCookie("templateId", querystring["templateId"])));
                    context.Response.SetCookie(SetCookieExpiry(new HttpCookie("provider", querystring["provider"])));
                    context.Response.SetCookie(SetCookieExpiry(new HttpCookie("functionName", querystring["functionName"])));
                    context.Response.RedirectLocation = "/?trial=true";
                    context.Response.StatusCode = 302;
                    context.Response.End();

                }
            }
        }

        private static HttpCookie SetCookieExpiry(HttpCookie httpCookie)
        {
            httpCookie.Expires = DateTime.Now.AddHours(1);
            return httpCookie;
        }
    }
}