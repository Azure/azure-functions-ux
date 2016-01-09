using System.Web.Http;
using System.Web.Http.Routing;

namespace AzureFunctions.App_Start
{
    public class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            GlobalConfiguration.Configuration.Formatters.XmlFormatter.SupportedMediaTypes.Clear();
        }
    }
}