using System.Net;

namespace AzureFunctions.Modules
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
    }
}