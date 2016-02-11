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

            builder.RegisterType<Settings>()
                .As<ISettings>()
                .SingleInstance();

            builder.RegisterType<ArmManager>()
                .As<IArmManager>()
                .InstancePerRequest();
        }

        private void RegisterRoutes(HttpConfiguration config)
        {
            config.Routes.MapHttpRoute("get-functions-container", "api/get", new { controller = "AzureFunctions", action = "GetFunctionContainer" }, new { verb = new HttpMethodConstraint(HttpMethod.Get) });
            config.Routes.MapHttpRoute("create-function-container", "api/create", new { controller = "AzureFunctions", action = "CreateFunctionsContainer" }, new { verb = new HttpMethodConstraint(HttpMethod.Post) });
            config.Routes.MapHttpRoute("create-trial-function-container", "api/createtrial", new { controller = "AzureFunctions", action = "CreateTrialFunctionsContainer" }, new { verb = new HttpMethodConstraint(HttpMethod.Post) });
            config.Routes.MapHttpRoute("list-subscriptions", "api/subscriptions", new { controller = "AzureFunctions", action = "ListSubscriptions" }, new { verb = new HttpMethodConstraint(HttpMethod.Get) });
            config.Routes.MapHttpRoute("list-serverfarms", "api/serverfarms", new { controller = "AzureFunctions", action = "ListServerFarms" }, new { verb = new HttpMethodConstraint(HttpMethod.Get) });
            config.Routes.MapHttpRoute("kudu-passthrough", "api/passthrough", new { controller = "AzureFunctions", action = "Passthrough" }, new { verb = new HttpMethodConstraint(HttpMethod.Post) });

            config.Routes.MapHttpRoute("list-tenants", "api/tenants", new { controller = "ARM", action = "GetTenants" }, new { verb = new HttpMethodConstraint(HttpMethod.Get) });
            config.Routes.MapHttpRoute("switch-tenants", "api/switchtenants/{tenantId}", new { controller = "ARM", action = "SwitchTenants" }, new { verb = new HttpMethodConstraint(HttpMethod.Get) });
            config.Routes.MapHttpRoute("get-token", "api/token", new { controller = "ARM", action = "GetToken" }, new { verb = new HttpMethodConstraint(HttpMethod.Get) });
        }
    }
}