using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Routing;

namespace AzureFunctions.App_Start
{
    public class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            config.Routes.MapHttpRoute("initialize-user", "api/init", new { controller = "AzureFunctions", action = "InitializeUser" }, new { verb = new HttpMethodConstraint(HttpMethod.Post) });
            config.Routes.MapHttpRoute("kudu-passthrough", "api/passthrough", new { controller = "AzureFunctions", action = "Passthrough" }, new { verb = new HttpMethodConstraint(HttpMethod.Post) });
            GlobalConfiguration.Configuration.Formatters.XmlFormatter.SupportedMediaTypes.Clear();
        }
    }
}