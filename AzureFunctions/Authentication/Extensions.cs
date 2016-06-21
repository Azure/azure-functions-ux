using System.Net;

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
    }
}