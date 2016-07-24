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
    }
}