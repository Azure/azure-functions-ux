using System;
using System.Net;
using System.Text;
using System.Web.Security;
using AzureFunctions.Code;

namespace AzureFunctions.Authentication
{
    public static class Extensions
    {
        public static HttpWebResponse GetResponseWithoutExceptions(this HttpWebRequest request)
        {
            try
            {
                return (HttpWebResponse)request.GetResponse();
            }
            catch (WebException e)
            {
                return (HttpWebResponse)e.Response;
            }
        }

        public static string PadBase64(this string value)
        {
            return value.Length % 4 == 0
                ? value
                : value.PadRight(value.Length + (4 - value.Length % 4), '=');
        }

        public static string Encrypt(this string str, string reason = null)
        {
            var valueBytes = Encoding.Default.GetBytes(str);
            var encryptedBytes = MachineKey.Protect(valueBytes, reason ?? Settings.DefaultEncryptReason);
            return Convert.ToBase64String(encryptedBytes);
        }

        public static string Decrypt(this string str, string reason = null)
        {
            var encryptesBytes = Convert.FromBase64String(str.PadBase64());
            var decryptedBytes = MachineKey.Unprotect(encryptesBytes, reason ?? Settings.DefaultEncryptReason);
            if (decryptedBytes != null)
            {
                return Encoding.Default.GetString(decryptedBytes);
            }
            throw new Exception("decrypted value is null");
        }
    }
}