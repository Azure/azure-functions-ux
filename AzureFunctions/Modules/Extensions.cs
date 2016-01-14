using AzureFunctions.Common;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;

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

        public async static Task<HttpResponseMessage> EnsureSuccessStatusCodeWithFullError(this HttpResponseMessage response)
        {
            if (!response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                throw new FailedRequestException(response.RequestMessage.RequestUri, content, response.StatusCode, $"Response status code does not indicate success {response.RequestMessage.RequestUri} {content} {response.StatusCode}");
            }
            return response;
        }
    }
}