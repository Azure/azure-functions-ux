using AzureFunctions.App_Start;
using System.Web.Http;

namespace AzureFunctions
{
    public class Global : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            WebApiConfig.Register(GlobalConfiguration.Configuration);
        }
    }
}