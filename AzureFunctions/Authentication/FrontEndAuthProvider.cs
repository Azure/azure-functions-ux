using AzureFunctions.Common;
using AzureFunctions.Contracts;
using System;
using System.IdentityModel.Tokens;
using System.Linq;
using System.Net;
using System.Security.Principal;
using System.Threading;
using System.Web;
using static AzureFunctions.Authentication.ClaimTypes;

namespace AzureFunctions.Authentication
{
    public class FrontEndAuthProvider : IAuthProvider
    {
        private readonly ISettings _settings;

        public FrontEndAuthProvider(ISettings settings)
        {
            this._settings = settings;
        }

        public bool TryAuthenticateRequest(HttpContextBase context)
        {
            IPrincipal principal = null;
            var request = context.Request;
            var displayName = request.Headers[Constants.FrontEndDisplayNameHeader];
            var principalName = request.Headers[Constants.FrontEndPrincipalNameHeader];
            var portalToken = request.Headers[Constants.PortalTokenHeader];

            if (string.Equals(principalName, Constants.AnonymousUserName, StringComparison.OrdinalIgnoreCase))
            {
                if (request.UrlReferrer?.Host.EndsWith(Constants.PortalReferrer, StringComparison.OrdinalIgnoreCase) == true)
                {
                    principal = new AzureFunctionsPrincipal(new AzureFunctionsIdentity(Constants.PortalAnonymousUser));
                }
                else if (string.IsNullOrEmpty(portalToken))
                {
                    principal = new AzureFunctionsPrincipal(new AzureFunctionsIdentity(Constants.AnonymousUserName));
                }
                else
                {
                    principal = ParsePortalToken(portalToken);
                }
            }
            else if (!string.IsNullOrWhiteSpace(principalName) ||
                     !string.IsNullOrWhiteSpace(displayName))
            {
                principal = new AzureFunctionsPrincipal(new AzureFunctionsIdentity(principalName ?? displayName));
            }
            else
            {
                // throw?
                principal = new AzureFunctionsPrincipal(new AzureFunctionsIdentity(Constants.AnonymousUserName));
            }

            context.User = principal;
            Thread.CurrentPrincipal = principal;

            return (principal.Identity as AzureFunctionsIdentity)?.IsAuthenticated == true;
        }

        public void PutOnCorrectTenant(HttpContextBase context)
        {
            var currentTenant = context.Request.Headers["X-MS-OAUTH-TENANTID"];

            if (string.IsNullOrEmpty(currentTenant)) return;

            string correctTenant;
            if (TryGetCorrectTenant(out correctTenant))
            {
                if (!string.IsNullOrEmpty(currentTenant) && !correctTenant.Equals(currentTenant, StringComparison.OrdinalIgnoreCase))
                {
                    HttpContext.Current.Response.Redirect(string.Format("/api/tenants/{0}?cx={1}", correctTenant, WebUtility.UrlEncode(HttpContext.Current.Request.RawUrl)), endResponse: true);
                }
            }
        }

        private AzureFunctionsPrincipal ParsePortalToken(string portalToken)
        {
            if (string.IsNullOrEmpty(portalToken))
            {
                throw new ArgumentException($"{nameof(portalToken)} cannot be null or empty.");
            }

            var jwt = new JwtSecurityToken(portalToken);

            var principalName = jwt.Claims.FirstOrDefault(c => c.Type == Email)?.Value ?? jwt.Claims.FirstOrDefault(c => c.Type == UniqueName)?.Value;
            var displayName = jwt.Claims.FirstOrDefault(c => c.Type == Name)?.Value ?? jwt.Claims.FirstOrDefault(c => c.Type == GivenName)?.Value;

            return new AzureFunctionsPrincipal(new AzureFunctionsIdentity(principalName ?? displayName));
        }

        private bool TryGetTenantForSubscription(string subscriptionId, out string tenantId)
        {
            tenantId = string.Empty;
            var requestUri = string.Format(Constants.SubscriptionTemplate, _settings.AzureResourceManagerEndpoint, subscriptionId, Constants.CSMApiVersion);
            var request = WebRequest.CreateHttp(requestUri);
            using (var response = request.GetResponseWithoutExceptions())
            {
                if (response.StatusCode != HttpStatusCode.Unauthorized)
                {
                    System.Diagnostics.Trace.TraceError(string.Format("Expected status {0} != {1} GET {2}", HttpStatusCode.Unauthorized, response.StatusCode, requestUri));
                    return false;
                }

                var header = response.Headers["WWW-Authenticate"];
                if (header == null || string.IsNullOrEmpty(header))
                {
                    System.Diagnostics.Trace.TraceError(string.Format("Missing WWW-Authenticate response header GET {0}", requestUri));
                    return false;
                }

                // WWW-Authenicate: Bearer authorization_uri="https://login.windows.net/{tenantId}", error="invalid_token", error_description="The access token is missing or invalid."
                var index = header.IndexOf("authorization_uri=", StringComparison.OrdinalIgnoreCase);
                if (index == -1)
                {
                    System.Diagnostics.Trace.TraceError(string.Format("Invalid WWW-Authenticate response header {0} GET {1}", header, requestUri));
                    return false;
                }

                tenantId =
                    header.Substring(index).Split(new[] { '\"', '=' }, StringSplitOptions.RemoveEmptyEntries)
                    .Skip(1)
                    .Take(1)
                    .Select(s => new Uri(s).AbsolutePath.Trim('/'))
                    .First();
                return !string.IsNullOrEmpty(tenantId);
            }
        }

        private bool TryGetCorrectTenant(out string correctTenant)
        {
            correctTenant = string.Empty;
            var path = HttpContext.Current.Request.RawUrl;
            var index = path.IndexOf("/subscriptions/", StringComparison.OrdinalIgnoreCase);

            if (index == -1) return false;

            var subscription = path.Split(new[] { '/' }, StringSplitOptions.RemoveEmptyEntries).Skip(1).FirstOrDefault();

            if (subscription == null) return false;

            return TryGetTenantForSubscription(subscription, out correctTenant);
        }

        public string GetLoginUrl(HttpContextBase context)
        {
            var request = context.Request;
            return $"{request.Url.GetLeftPart(UriPartial.Authority).TrimEnd('/')}/signin{request.Url.Query}";
        }
    }
}