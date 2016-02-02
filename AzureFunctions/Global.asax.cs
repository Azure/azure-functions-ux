using Autofac;
using Autofac.Integration.WebApi;
using System.Net.Http;
using System.Reflection;
using System.Web.Http;
using System.Web.Http.Routing;
using System;
using AzureFunctions.Code;
using System.Web;
using AzureFunctions.Contracts;

namespace AzureFunctions
{
    public class Global : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            var builder = new ContainerBuilder();
            var config = GlobalConfiguration.Configuration;

            builder.RegisterApiControllers(Assembly.GetExecutingAssembly());
            RegisterTypes(builder);
            var container = builder.Build();
            config.DependencyResolver = new AutofacWebApiDependencyResolver(container);
         
            GlobalConfiguration.Configuration.Formatters.XmlFormatter.SupportedMediaTypes.Clear();
            RegisterRoutes(config);
        }

        private void RegisterTypes(ContainerBuilder builder)
        {
            builder.Register(c => new HttpContextWrapper(HttpContext.Current))
                .As<HttpContextBase>()
                .InstancePerRequest();

            builder.Register(c => c.Resolve<HttpContextBase>().Request)
                .As<HttpRequestBase>()
                .InstancePerRequest();

            builder.RegisterType<UserSettings>()
                .As<IUserSettings>()
                .InstancePerRequest();

            builder.RegisterType<ArmManager>()
                .As<IArmManager>()
                .InstancePerRequest();
        }

        private void RegisterRoutes(HttpConfiguration config)
        {
            config.Routes.MapHttpRoute("initialize-user", "api/init", new { controller = "AzureFunctions", action = "InitializeUser" }, new { verb = new HttpMethodConstraint(HttpMethod.Post) });
            config.Routes.MapHttpRoute("kudu-passthrough", "api/passthrough", new { controller = "AzureFunctions", action = "Passthrough" }, new { verb = new HttpMethodConstraint(HttpMethod.Post) });
        }
    }
}