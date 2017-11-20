using AzureFunctions.Contracts;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IdentityModel;
using System.IdentityModel.Protocols.WSTrust;
using System.IdentityModel.Services;
using System.IdentityModel.Tokens;
using System.Linq;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Security.Cryptography.X509Certificates;
using System.Security.Principal;
using System.Text;
using System.Threading;
using System.Web;

namespace AzureFunctions.Authentication
{
    public class StandaloneAuthProvider : IAuthProvider
    {
        private const string TenantIdClaimType = "http://schemas.microsoft.com/identity/claims/tenantid";
        private const string NonceClaimType = "nonce";
        private const string OAuthTokenCookie = "OAuthToken";
        private const string DeleteCookieFormat = "{0}=deleted; ; path=/; secure; HttpOnly;expires=Thu, 01 Jan 1970 00:00:00 GMT";
        private const int CookieChunkSize = 2000;

        private readonly X509Certificate2 _signingCert;
        private readonly string _appliesToAddress = $"https://{Environment.MachineName.ToLower()}";
        private readonly string _tokenIssuerName = $"https://{Environment.MachineName.ToLower()}/token";
        private readonly ISettings _settings;

        private readonly CookieTransform[] DefaultCookieTransforms = new CookieTransform[]
        {
            new DeflateCookieTransform(),
            new MachineKeyTransform()
        };

        public StandaloneAuthProvider(ISettings settings)
        {
            this._settings = settings;
            this._signingCert = FindSigningCertificate();
        }

        public bool TryAuthenticateRequest(HttpContextBase context)
        {
            ClaimsPrincipal principal = null;
            var request = context.Request;
            var response = context.Response;

            if (request.Url.Scheme != "https")
            {
                response.Redirect(String.Format("https://{0}{1}", request.Url.Authority, request.Url.PathAndQuery), endResponse: true);
                return false;
            }

            bool authTokenAvailableInHeader;
            var token = ReadOAuthTokenCookie(context);
            if (token != null)
            {
                authTokenAvailableInHeader = true;
                if (token.IsValid())
                {
                    principal = new ClaimsPrincipal(new ClaimsIdentity("Standalone"));
                    request.ServerVariables["HTTP_X_MS_OAUTH_TOKEN"] = token.access_token;
                }
            }
            else
            {
                authTokenAvailableInHeader = false;
                var authHeader = context.Request.Headers["Authorization"];
                if (authHeader != null)
                {
                    var authHeaderVal = AuthenticationHeaderValue.Parse(authHeader);
                    if (authHeaderVal.Scheme.Equals("basic", StringComparison.OrdinalIgnoreCase) && authHeaderVal.Parameter != null)
                    {
                        if (AuthenticateUser(authHeaderVal.Parameter, out token))
                        {
                            WriteOAuthTokenCookie(context, token);

                            principal = new ClaimsPrincipal(new ClaimsIdentity("Standalone"));
                            request.ServerVariables["HTTP_X_MS_OAUTH_TOKEN"] = token.access_token;
                        }
                    }
                }
            }

            if (request.QueryString["logout"] == "true")
            {

                if (!authTokenAvailableInHeader)
                {
                    response.Redirect(String.Format("https://{0}", request.Url.Authority), endResponse: true);
                    return true;
                }
                RemoveSessionCookie(context);
                principal = null;
            }

            if (principal == null)
            {
                response.StatusCode = 401;
                response.Headers.Add("WWW-Authenticate", "Basic realm=\"Functions Runtime\"");
            }

            Thread.CurrentPrincipal = principal;
            HttpContext.Current.User = principal;
            return true;
        }

        public void PutOnCorrectTenant(HttpContextBase context)
        {
            return;
        }

        public string GetLoginUrl(HttpContextBase context)
        {
            return context.Request.Url.GetLeftPart(UriPartial.Authority);
        }

        private static X509Certificate2 FindSigningCertificate()
        {
            try
            {
                X509Store myStore = new X509Store(StoreName.My, StoreLocation.LocalMachine);
                myStore.Open(OpenFlags.ReadOnly | OpenFlags.OpenExistingOnly);
                X509Certificate2Collection certCollection = myStore.Certificates.Find(X509FindType.FindByThumbprint, SecuritySettings.SigningCertificateThumbprint, validOnly: false);
                myStore.Close();

                return certCollection[0];
            }
            catch
            {
                return null;
            }
        }

        private bool AuthenticateUser(string credentials, out AADOAuth2AccessToken token)
        {
            token = null;

            try
            {
                var encoding = Encoding.GetEncoding("iso-8859-1");
                credentials = encoding.GetString(Convert.FromBase64String(credentials));

                int separator = credentials.IndexOf(':');
                string name = credentials.Substring(0, separator);
                string password = credentials.Substring(separator + 1);

                if (NetworkHelper.IsValidUser(name, password))
                {
                    token = CreateTokenWithX509SigningCredentials(NetworkHelper.GetUniqueLogonUserName(name));

                    return true;
                }
            }
            catch (FormatException) { }

            return false;
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

        private AADOAuth2AccessToken CreateTokenWithX509SigningCredentials(string username)
        {
            string displayName;
            if (!NetworkHelper.TryGetAccountFullName(username, out displayName)) {
                displayName = string.Empty;
            } 
            DateTime expiresOn = DateTime.UtcNow.AddYears(1);

            var claimsIdentity = new ClaimsIdentity(new List<Claim>()
            {
                new Claim(ClaimTypes.UniqueName, username),
                new Claim(System.Security.Claims.ClaimTypes.NameIdentifier, username),
                new Claim(System.Security.Claims.ClaimTypes.Role, "User"),
                new Claim(System.Security.Claims.ClaimTypes.Upn, username),
                new Claim(System.Security.Claims.ClaimTypes.Version, "1.0"),
                new Claim(System.Security.Claims.ClaimTypes.GivenName, displayName)
            }, "Custom");

            var securityTokenDescriptor = new SecurityTokenDescriptor()
            {
                AppliesToAddress = _appliesToAddress,
                TokenIssuerName = _tokenIssuerName,
                Subject = claimsIdentity,
                Lifetime = new Lifetime(DateTime.UtcNow, expiresOn),
                SigningCredentials = new X509SigningCredentials(_signingCert),
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var plainToken = tokenHandler.CreateToken(securityTokenDescriptor);
            var tokenString = tokenHandler.WriteToken(plainToken);

            return new AADOAuth2AccessToken()
            {
                expires_on = Convert.ToInt32(expiresOn.Subtract(AADOAuth2AccessToken.EpochTime).TotalSeconds).ToString(),
                access_token = tokenString,
                resource = _settings.ManagementResource
            };
        }
    }
}