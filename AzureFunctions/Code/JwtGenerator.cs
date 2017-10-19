using System;
using System.IdentityModel.Protocols.WSTrust;
using System.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;

namespace AzureFunctions.Code
{
    internal class JwtGenerator
    {
        public static string GenerateToken(string issuer, string audience, string key, DateTime? notBefore = null, DateTime? expires = null)
        {
            notBefore = notBefore ?? DateTime.UtcNow;
            expires = expires ?? DateTime.UtcNow.AddMinutes(30);

            if (key == null)
            {
                throw new NullReferenceException("A key value was not provided and a default key is not present.");
            }

            var handler = new JwtSecurityTokenHandler();

            var claimsIdentity = new ClaimsIdentity();
            var signingCredentials = new SigningCredentials(new InMemorySymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
                SecurityAlgorithms.HmacSha256Signature,
                SecurityAlgorithms.HmacSha256Signature);
            var lifeTime = new Lifetime(notBefore, expires);
            var token = handler.CreateToken(issuer, audience, subject: claimsIdentity, lifetime: lifeTime, signingCredentials: signingCredentials);

            return token.RawData;
        }
    }
}