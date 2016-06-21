using Autofac;
using Autofac.Integration.WebApi;
using AzureFunctions.Authentication;
using AzureFunctions.Code;
using AzureFunctions.Common;
using AzureFunctions.Contracts;
using AzureFunctions.Trace;
using Serilog;
using Serilog.Events;
using Serilog.Sinks.MSSqlServer;
using SerilogWeb.Classic.Enrichers;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Data;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Reflection;
using System.Web;
using System.Web.Hosting;
using System.Web.Http;
using System.Web.Routing;

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

        protected void Application_BeginRequest(object sender, EventArgs e)
        {
            var context = new HttpContextWrapper(HttpContext.Current);
            SecurityManager.HandleTryAppServiceResponse(context);
            SecurityManager.PutOnCorrectTenant(context);
        }

        protected void Application_AuthenticateRequest(object sender, EventArgs e)
        {
            var context = new HttpContextWrapper(HttpContext.Current);

            var isFile = FileSystemHelpers.FileExists(HostingEnvironment.MapPath($"~{context.Request.Url.AbsolutePath.Replace('/', '\\')}"));
            var route = RouteTable.Routes.GetRouteData(context);
            // If the route is not registerd in the WebAPI RouteTable
            //      then it's not an API route, which means it's a resource (*.js, *.css, *.cshtml), not authenticated.
            // If the route doesn't have authenticated value assume true
            var isAuthenticated = route != null && (route.Values["authenticated"] == null || (bool)route.Values["authenticated"]);
            var isTryPageRequested = context.Request.RawUrl.StartsWith("/try");
            var isOpenApiRoute = (context.Request.RawUrl.StartsWith("/api") && !isAuthenticated);

            if (   !isFile              //skip auth for files
                && !isTryPageRequested  //when requesting /try users can be unauthenticated
                && !isOpenApiRoute      // some templateresource APIs dont need authentication
                && !SecurityManager.TryAuthenticateRequest(context)) // and if the user is not loggedon
            {
                if (isAuthenticated)
                {
                    context.Response.Headers["LoginUrl"] = SecurityManager.GetLoginUrl(context);
                    context.Response.StatusCode = 403; // Forbidden
                }
                else if (context.Request.Url.AbsolutePath.Equals("/api/health", StringComparison.OrdinalIgnoreCase))
                {
                    context.Response.WriteFile(HostingEnvironment.MapPath("~/health.html"));
                    context.Response.Flush();
                    context.Response.End();
                }
                else if (!isFile)
                {
                    context.Response.RedirectLocation = Environment.GetEnvironmentVariable("ACOM_MARKETING_PAGE") ?? $"{context.Request.Url.GetLeftPart(UriPartial.Authority)}/signin";
                    context.Response.StatusCode = 302;
                    context.Response.End();
                }
            }
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
            var settings = container.Resolve<ISettings>();
            if (settings.LogLoggingDebugInfo)
            {
                var logsPath = string.IsNullOrEmpty(Environment.GetEnvironmentVariable("WEBSITE_SITE_NAME"))
                    ? HostingEnvironment.ApplicationPhysicalPath
                    : Path.Combine(Environment.GetEnvironmentVariable("HOME"), "LogFiles");

                var file = File.CreateText(Path.Combine(logsPath, $"serilog-{Environment.GetEnvironmentVariable("WEBSITE_INSTANCE_ID")?.Substring(0, 7)}.log"));
                Serilog.Debugging.SelfLog.Out = TextWriter.Synchronized(file);
            }

            FunctionsTrace.Diagnostics = CreateLogger(settings, "functions-diagnostics-{Date}.txt", "Diagnostics");
            FunctionsTrace.Analytics = CreateLogger(settings, "functions-analytics-{Date}.txt", "Analytics");
            FunctionsTrace.Performance = CreateLogger(settings, "functions-performance-{Date}.txt", "Performance", new Collection<DataColumn>
            {
                new DataColumn {DataType = typeof(string), ColumnName = "OperationName" },
                new DataColumn {DataType = typeof(int), ColumnName = "TimeTakenMsec" },
                new DataColumn {DataType = typeof(string), ColumnName = "OperationResult" },
                new DataColumn {DataType = typeof(DateTime), ColumnName = "StartedTime" }
            });
        }

        private ILogger CreateLogger(ISettings settings, string fileName = null, string tableName = null, ICollection<DataColumn> additionalColumns = null, bool? logToFile = null, bool? logToSql = null)
        {
            var logsPath = string.IsNullOrEmpty(Environment.GetEnvironmentVariable("WEBSITE_SITE_NAME"))
                ? HostingEnvironment.ApplicationPhysicalPath
                : Path.Combine(Environment.GetEnvironmentVariable("HOME"), "LogFiles");

            var logger = new LoggerConfiguration()
                .Enrich.With<HttpRequestIdEnricher>()
                .Enrich.With<UserNameEnricher>()
                .Enrich.With<EventIdEnricher>();

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
                        new DataColumn {DataType = typeof(string), ColumnName = "HttpRequestId"},
                        new DataColumn {DataType = typeof(int), ColumnName = "EventId"}
                    }
                    .Union(additionalColumns ?? Enumerable.Empty<DataColumn>())
                    .ToList()
                };
                logger = logger.WriteTo.MSSqlServer(settings.LoggingSqlServerConnectionString, tableName, restrictedToMinimumLevel: LogEventLevel.Information, columnOptions: columnOptions);
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

            builder.Register(c =>
            {
                var userSettings = c.Resolve<IUserSettings>();
                var client = new HttpClient();

                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", userSettings.BearerToken);
                client.DefaultRequestHeaders.Add("User-Agent", Constants.UserAgent);
                client.DefaultRequestHeaders.Add("Accept", Constants.ApplicationJson);
                return client;
            })
            .As<HttpClient>()
            .InstancePerRequest();

            builder.RegisterType<TemplatesManager>()
                .As<ITemplatesManager>()
                .SingleInstance();
        }

        private void RegisterRoutes(HttpConfiguration config)
        {
            config.Routes.MapHttpRoute("list-templates", "api/templates", new { controller = "AzureFunctions", action = "ListTemplates", authenticated = false }, new { verb = new HttpMethodConstraint(HttpMethod.Get.ToString()) });
            config.Routes.MapHttpRoute("get-binding-config", "api/bindingconfig", new { controller = "AzureFunctions", action = "GetBindingConfig", authenticated = false}, new { verb = new HttpMethodConstraint(HttpMethod.Get.ToString()) });

            config.Routes.MapHttpRoute("list-tenants", "api/tenants", new { controller = "ARM", action = "GetTenants", authenticated = true }, new { verb = new HttpMethodConstraint(HttpMethod.Get.ToString()) });
            config.Routes.MapHttpRoute("switch-tenants", "api/switchtenants/{tenantId}/{*path}", new { controller = "ARM", action = "SwitchTenants", authenticated = true }, new { verb = new HttpMethodConstraint(HttpMethod.Get.ToString()) });
            config.Routes.MapHttpRoute("get-token", "api/token", new { controller = "ARM", action = "GetToken", authenticated = true}, new { verb = new HttpMethodConstraint(HttpMethod.Get.ToString()) });

            config.Routes.MapHttpRoute("report-client-error", "api/clienterror", new { controller = "AzureFunctions", action = "ReportClientError", authenticated = false }, new { verb = new HttpMethodConstraint(HttpMethod.Post.ToString()) });
            config.Routes.MapHttpRoute("get-resources", "api/resources", new { controller = "AzureFunctions", action = "GetResources", authenticated = false}, new { verb = new HttpMethodConstraint(HttpMethod.Get.ToString()) });
        }
    }
}