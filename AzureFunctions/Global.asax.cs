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
using Serilog;
using AzureFunctions.Trace;
using System.Web.Hosting;
using System.IO;
using SerilogWeb.Classic.Enrichers;
using Serilog.Events;
using Serilog.Sinks.MSSqlServer;
using System.Collections.ObjectModel;
using System.Data;
using System.Linq;
using System.Collections.Generic;

namespace AzureFunctions
{
    public class Global : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            var container = InitAutofacContainer();
            
            var config = GlobalConfiguration.Configuration;
            config.IncludeErrorDetailPolicy = IncludeErrorDetailPolicy.Always;
            config.DependencyResolver = new AutofacWebApiDependencyResolver(container);

            GlobalConfiguration.Configuration.Formatters.XmlFormatter.SupportedMediaTypes.Clear();
            InitLogging(container);
            RegisterRoutes(config);
        }

        private IContainer InitAutofacContainer()
        {
            var builder = new ContainerBuilder();

            builder.RegisterApiControllers(Assembly.GetExecutingAssembly());
            RegisterTypes(builder);
            return builder.Build();
        }

        private void InitLogging(IContainer container)
        {
            FunctionsTrace.Diagnostics = CreateLogger(container, "functions-diagnostics-{Date}.txt", "Diagnostics" );
            FunctionsTrace.Analytics = CreateLogger(container, "functions-analytics-{Date}.txt", "Analytics");
            FunctionsTrace.Performance = CreateLogger(container, "functions-performance-{Date}.txt", "Performance", new Collection<DataColumn>
            {
                new DataColumn {DataType = typeof(string), ColumnName = "OperationName" },
                new DataColumn {DataType = typeof(int), ColumnName = "TimeTakenMsec" },
                new DataColumn {DataType = typeof(string), ColumnName = "OperationResult" }
            });
        }

        private ILogger CreateLogger(IContainer container, string fileName = null, string tableName = null, ICollection<DataColumn> additionalColumns = null, bool? logToFile = null, bool? logToSql = null)
        {
            var settings = container.Resolve<ISettings>();
            var logsPath = string.IsNullOrEmpty(Environment.GetEnvironmentVariable("WEBSITE_SITE_NAME"))
                ? HostingEnvironment.ApplicationPhysicalPath
                : Path.Combine(Environment.GetEnvironmentVariable("HOME"), "LogFiles");

            var logger = new LoggerConfiguration()
                .Enrich.With<HttpRequestIdEnricher>()
                .Enrich.With<UserNameEnricher>();

            if (logToFile ?? settings.LogToFile && !string.IsNullOrEmpty(fileName))
            {
                logger = logger.WriteTo.RollingFile(Path.Combine(logsPath, fileName), fileSizeLimitBytes: null);
            }

            if (logToSql ?? settings.LogToSql &&
                !string.IsNullOrEmpty(settings.LoggingSqlServerConnectionString) &&
                !string.IsNullOrEmpty(tableName))
            {
                var columnOptions = new ColumnOptions
                {
                    AdditionalDataColumns = new Collection<DataColumn>
                    {
                        new DataColumn {DataType = typeof(string), ColumnName = "UserName"},
                        new DataColumn {DataType = typeof(string), ColumnName = "HttpRequestId"}
                    }
                    .Union(additionalColumns ?? Enumerable.Empty<DataColumn>())
                    .ToList()
                };
                logger = logger.WriteTo.MSSqlServer(settings.LoggingSqlServerConnectionString, tableName, LogEventLevel.Information, columnOptions: columnOptions);
            }
            return logger.CreateLogger();
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
            config.Routes.MapHttpRoute("get-functions-container", "api/get/{*resourceId}", new { controller = "AzureFunctions", action = "GetFunctionContainer" }, new { verb = new HttpMethodConstraint(HttpMethod.Get) });
            config.Routes.MapHttpRoute("create-function-container", "api/create", new { controller = "AzureFunctions", action = "CreateFunctionsContainer" }, new { verb = new HttpMethodConstraint(HttpMethod.Post) });
            config.Routes.MapHttpRoute("create-trial-function-container", "api/createtrial", new { controller = "AzureFunctions", action = "CreateTrialFunctionsContainer" }, new { verb = new HttpMethodConstraint(HttpMethod.Post) });
            config.Routes.MapHttpRoute("list-subscriptions", "api/subscriptions", new { controller = "AzureFunctions", action = "ListSubscriptions" }, new { verb = new HttpMethodConstraint(HttpMethod.Get) });
            config.Routes.MapHttpRoute("list-serverfarms", "api/serverfarms", new { controller = "AzureFunctions", action = "ListServerFarms" }, new { verb = new HttpMethodConstraint(HttpMethod.Get) });
            config.Routes.MapHttpRoute("kudu-passthrough", "api/passthrough", new { controller = "AzureFunctions", action = "Passthrough" }, new { verb = new HttpMethodConstraint(HttpMethod.Post) });

            config.Routes.MapHttpRoute("list-tenants", "api/tenants", new { controller = "ARM", action = "GetTenants" }, new { verb = new HttpMethodConstraint(HttpMethod.Get) });
            config.Routes.MapHttpRoute("switch-tenants", "api/switchtenants/{tenantId}/{*path}", new { controller = "ARM", action = "SwitchTenants" }, new { verb = new HttpMethodConstraint(HttpMethod.Get) });
            config.Routes.MapHttpRoute("get-token", "api/token", new { controller = "ARM", action = "GetToken" }, new { verb = new HttpMethodConstraint(HttpMethod.Get) });
        }
    }
}