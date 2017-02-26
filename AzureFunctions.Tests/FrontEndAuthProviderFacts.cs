using AzureFunctions.Authentication;
using AzureFunctions.Common;
using NSubstitute;
using System;
using System.Collections.Specialized;
using System.IdentityModel.Tokens;
using System.Security.Claims;
using System.Web;
using Xunit;
using AzureFunctions.Code;

namespace AzureFunctions.Tests
{
    public class FrontEndAuthProviderFacts
    {
        [Theory]
        [InlineData("example0@example.com", "板垣", "透透")]
        [InlineData("example1@example.com", "أم", "كلثوم")]
        [InlineData("example2@example.com", "Jane", "Doe")]
        public void ParseJwtWithInternationalCharacters(string email, string firstName, string lastName)
        {
            var jwt = GetJwtString(email, firstName, lastName);

            var context = Substitute.For<HttpContextBase>();
            var request = Substitute.For<HttpRequestBase>();

            var headers = new NameValueCollection();
            headers.Add(Constants.FrontEndDisplayNameHeader, string.Empty);
            headers.Add(Constants.FrontEndPrincipalNameHeader, Constants.AnonymousUserName);
            headers.Add(Constants.PortalTokenHeader, jwt);

            request.Headers.Returns(headers);
            request.UrlReferrer.Returns(new Uri("http://example.com"));
            context.Request.Returns(request);

            var frontEndAuth = new FrontEndAuthProvider(new Settings());
            Assert.True(frontEndAuth.TryAuthenticateRequest(context), $"Assert TryAuthenticate is successful. {email}, {firstName}, {lastName}");
            Assert.NotNull(context.User);
            Assert.True(context.User is AzureFunctionsPrincipal);
            var user = context.User as AzureFunctionsPrincipal;
            Assert.True(user.Identity is AzureFunctionsIdentity);
            var identity = user.Identity as AzureFunctionsIdentity;
            Assert.Equal(email, identity.Name);
        }

        private string GetJwtString(string email, string firstName, string lastName)
        {
            var jwtTokenHandler = new JwtSecurityTokenHandler();
            var token = jwtTokenHandler.CreateToken(new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(Authentication.ClaimTypes.Name, email),
                    new Claim(Authentication.ClaimTypes.Email, email),
                    new Claim(Authentication.ClaimTypes.Name, $"{firstName} {lastName}"),
                    new Claim(Authentication.ClaimTypes.GivenName, firstName)
                }),
            });
            return jwtTokenHandler.WriteToken(token);
        }
    }
}
// Dummy commit to trigger deployment