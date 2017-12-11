using AzureFunctions.Contracts;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IdentityModel;
using System.IdentityModel.Selectors;
using System.IdentityModel.Services;
using System.IdentityModel.Tokens;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Text;
using System.Threading;
using System.Web;

namespace AzureFunctions.Authentication
{
    public class LocalhostAuthProvider : IAuthProvider
    {
        private const string TenantIdClaimType = "http://schemas.microsoft.com/identity/claims/tenantid";
        private const string NonceClaimType = "nonce";
        private const string OAuthTokenCookie = "OAuthToken";
        private const string DeleteCookieFormat = "{0}=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        private const int CookieChunkSize = 2000;

        private readonly ISettings _settings;

        private readonly CookieTransform[] DefaultCookieTransforms = new CookieTransform[]
        {
            new DeflateCookieTransform(),
            new MachineKeyTransform()
        };

        public LocalhostAuthProvider(ISettings settings)
        {
            this._settings = settings;
        }

        public bool TryAuthenticateRequest(HttpContextBase context)
        {
            ClaimsPrincipal principal = null;
            var request = context.Request;
            var response = context.Response;


            response.Headers["Strict-Transport-Security"] = "max-age=0";

            if(request.UrlReferrer != null && HttpUtility.ParseQueryString(request.UrlReferrer.Query).Get("trial") == "true")
            {
                return true;
            }

            if (request.Url.Scheme != "https")
            {
                response.Redirect(String.Format("https://{0}{1}", request.Url.Authority, request.Url.PathAndQuery), endResponse: true);
                return false;
            }

            if (request.Url.PathAndQuery.StartsWith("/logout", StringComparison.OrdinalIgnoreCase))
            {
                RemoveSessionCookie(context);

                var logoutUrl = GetLogoutUrl(context);
                response.Redirect(logoutUrl, endResponse: true);
                return false;
            }

            string tenantId = null;
            if (SwitchTenants(context, out tenantId))
            {
                RemoveSessionCookie(context);

                var loginUrl = GetLoginUrl(context, tenantId, "/token");
                response.Redirect(loginUrl, endResponse: true);
                return false;
            }

            var id_token = request.Form["id_token"];
            var code = request.Form["code"];
            var state = request.Form["state"];

            if (!String.IsNullOrEmpty(id_token) && !String.IsNullOrEmpty(code))
            {
                principal = AuthenticateIdToken(context, id_token);
                var tenantIdClaim = principal.Claims.FirstOrDefault(c => c.Type == TenantIdClaimType);

                // ADFS tokens will not have a tenantID claim in it.
                if (tenantIdClaim != null)
                {
                    tenantId = tenantIdClaim.Value;
                }

                var base_uri = request.Url.GetLeftPart(UriPartial.Authority);
                var redirect_uri = base_uri + "/manage";
                var token = AADOAuth2AccessToken.GetAccessTokenByCode(tenantId, code, redirect_uri);
                WriteOAuthTokenCookie(context, token);
                response.Redirect(base_uri + state, endResponse: true);
                return true;
            }
            else
            {
                var token = ReadOAuthTokenCookie(context);
                if (token != null)
                {
                    if (!token.IsValid())
                    {
                        token = AADOAuth2AccessToken.GetAccessTokenByRefreshToken(token.TenantId, token.refresh_token, _settings.ManagementResource);
                        WriteOAuthTokenCookie(context, token);
                    }

                    principal = new ClaimsPrincipal(new ClaimsIdentity("AAD"));
                    request.ServerVariables["HTTP_X_MS_OAUTH_TOKEN"] = token.access_token;
                }
            }

            if (principal == null)
            {
                var loginUrl = GetLoginUrl(context);
                response.Redirect(loginUrl, endResponse: true);
                return false;
            }

            HttpContext.Current.User = principal;
            Thread.CurrentPrincipal = principal;
            return true;
        }

        public void PutOnCorrectTenant(HttpContextBase context)
        {
            return;
        }

        private bool SwitchTenants(HttpContextBase context, out string tenantId)
        {
            tenantId = null;

            var request = context.Request;
            if (request.Url.PathAndQuery.StartsWith("/api/switchtenants", StringComparison.OrdinalIgnoreCase))
            {
                var parts = request.Url.PathAndQuery.Split(new[] { '/' }, StringSplitOptions.RemoveEmptyEntries);
                if (parts.Length >= 3)
                {
                    tenantId = parts[2];
                }
            }

            return tenantId != null;
        }

        private void RemoveSessionCookie(HttpContextBase context)
        {
            var request = context.Request;
            var response = context.Response;

            var cookies = request.Cookies;
            foreach (string name in new[] { OAuthTokenCookie })
            {
                int index = 0;
                while (true)
                {
                    string cookieName = name;
                    if (index > 0)
                    {
                        cookieName += index.ToString(CultureInfo.InvariantCulture);
                    }

                    if (cookies[cookieName] == null)
                    {
                        break;
                    }

                    // remove old cookie
                    response.Headers.Add("Set-Cookie", String.Format(DeleteCookieFormat, cookieName));
                    ++index;
                }
            }
        }

        private string GetLogoutUrl(HttpContextBase context)
        {
            var config = OpenIdConfiguration.Current;
            var request = context.Request;
            //var redirect_uri = new Uri(request.Url, LogoutComplete);

            StringBuilder strb = new StringBuilder();
            strb.Append(config.EndSessionEndpoint);
            //strb.AppendFormat("?post_logout_redirect_uri={0}", WebUtility.UrlEncode(redirect_uri.AbsoluteUri));

            return strb.ToString();
        }

        private string GetLoginUrl(HttpContextBase context, string tenantId = null, string state = null)
        {
            const string scope = "user_impersonation openid";
            const string site_id = "500879";

            var config = OpenIdConfiguration.Current;
            var request = context.Request;
            var response_type = "id_token code";
            var issuerAddress = config.GetAuthorizationEndpoint(tenantId);
            var redirect_uri = request.Url.GetLeftPart(UriPartial.Authority) + "/manage";
            var client_id = SecuritySettings.AADClientId;
            var nonce = GenerateNonce();
            var response_mode = "form_post";

            StringBuilder strb = new StringBuilder();
            strb.Append(issuerAddress);
            strb.AppendFormat("?response_type={0}", WebUtility.UrlEncode(response_type));
            strb.AppendFormat("&redirect_uri={0}", WebUtility.UrlEncode(redirect_uri));
            strb.AppendFormat("&client_id={0}", WebUtility.UrlEncode(client_id));
            strb.AppendFormat("&resource={0}", WebUtility.UrlEncode(_settings.ManagementResource));
            strb.AppendFormat("&scope={0}", WebUtility.UrlEncode(scope));
            strb.AppendFormat("&nonce={0}", WebUtility.UrlEncode(nonce));
            strb.AppendFormat("&site_id={0}", WebUtility.UrlEncode(site_id));
            strb.AppendFormat("&response_mode={0}", WebUtility.UrlEncode(response_mode));
            strb.AppendFormat("&state={0}", WebUtility.UrlEncode(state ?? request.Url.PathAndQuery));

            return strb.ToString();
        }

        private ClaimsPrincipal AuthenticateIdToken(HttpContextBase context, string id_token)
        {
            var config = OpenIdConfiguration.Current;
            var handler = new JwtSecurityTokenHandler();
            handler.CertificateValidator = X509CertificateValidator.None;
            if (!handler.CanReadToken(id_token))
            {
                throw new InvalidOperationException("No SecurityTokenHandler can authenticate this id_token!");
            }

            var parameters = new TokenValidationParameters();
            parameters.AllowedAudience = SecuritySettings.AADClientId;
            // this is just for Saml
            // paramaters.AudienceUriMode = AudienceUriMode.Always;
            parameters.ValidateIssuer = false;

            var tokens = new List<SecurityToken>();
            foreach (var key in config.IssuerKeys.Keys)
            {
                tokens.AddRange(key.GetSecurityTokens());
            }
            parameters.SigningTokens = tokens;

            // validate
            var principal = (ClaimsPrincipal)handler.ValidateToken(id_token, parameters);

            // verify nonce
            VerifyNonce(principal.FindFirst(NonceClaimType).Value);

            return principal;
        }

        private void WriteOAuthTokenCookie(HttpContextBase context, AADOAuth2AccessToken oauthToken)
        {
            var request = context.Request;
            var response = context.Response;

            var bytes = EncodeCookie(oauthToken);
            var cookie = Convert.ToBase64String(bytes);
            var chunkCount = cookie.Length / CookieChunkSize + (cookie.Length % CookieChunkSize == 0 ? 0 : 1);
            for (int i = 0; i < chunkCount; ++i)
            {
                var setCookie = new StringBuilder();
                setCookie.Append(OAuthTokenCookie);
                if (i > 0)
                {
                    setCookie.Append(i.ToString(CultureInfo.InvariantCulture));
                }

                setCookie.Append('=');

                int startIndex = i * CookieChunkSize;
                setCookie.Append(cookie.Substring(startIndex, Math.Min(CookieChunkSize, cookie.Length - startIndex)));
                setCookie.Append("; path=/; secure; HttpOnly");
                response.Headers.Add("Set-Cookie", setCookie.ToString());
            }

            var cookies = request.Cookies;
            var index = chunkCount;
            while (true)
            {
                var cookieName = OAuthTokenCookie;
                if (index > 0)
                {
                    cookieName += index.ToString(CultureInfo.InvariantCulture);
                }

                if (cookies[cookieName] == null)
                {
                    break;
                }

                // remove old cookie
                response.Headers.Add("Set-Cookie", String.Format(DeleteCookieFormat, cookieName));
                ++index;
            }
        }

        private AADOAuth2AccessToken ReadOAuthTokenCookie(HttpContextBase context)
        {
            var request = context.Request;

            // read oauthtoken cookie
            var cookies = request.Cookies;
            var strb = new StringBuilder();
            int index = 0;
            while (true)
            {
                var cookieName = OAuthTokenCookie;
                if (index > 0)
                {
                    cookieName += index.ToString(CultureInfo.InvariantCulture);
                }

                var cookie = cookies[cookieName];
                if (cookie == null)
                {
                    break;
                }

                strb.Append(cookie.Value);
                ++index;
            }

            if (strb.Length == 0)
            {
                return null;
            }

            var bytes = Convert.FromBase64String(strb.ToString());
            var oauthToken = DecodeCookie(bytes);
            if (oauthToken == null || !oauthToken.IsValid())
            {
                try
                {
                    if (oauthToken != null)
                    {
                        oauthToken = AADOAuth2AccessToken.GetAccessTokenByRefreshToken(oauthToken.TenantId, oauthToken.refresh_token, oauthToken.resource);
                    }
                }
                catch (Exception)
                {
                    oauthToken = null;
                }

                if (oauthToken == null)
                {
                    RemoveSessionCookie(context);

                    return null;
                }

                WriteOAuthTokenCookie(context, oauthToken);
            }

            return oauthToken;
        }

        private static string GenerateNonce()
        {
            return Guid.NewGuid().ToString();
        }

        public static void VerifyNonce(string nonce)
        {
        }

        private byte[] EncodeCookie(AADOAuth2AccessToken token)
        {
            var bytes = token.ToBytes();
            for (int i = 0; i < DefaultCookieTransforms.Length; ++i)
            {
                bytes = DefaultCookieTransforms[i].Encode(bytes);
            }
            return bytes;
        }

        private AADOAuth2AccessToken DecodeCookie(byte[] bytes)
        {
            try
            {
                for (int i = DefaultCookieTransforms.Length - 1; i >= 0; --i)
                {
                    bytes = DefaultCookieTransforms[i].Decode(bytes);
                }
                return AADOAuth2AccessToken.FromBytes(bytes);
            }
            catch (Exception)
            {
                // bad cookie
                return null;
            }
        }

        public string GetLoginUrl(HttpContextBase context)
        {
            return GetLoginUrl(context, null, null);
        }
    }
}