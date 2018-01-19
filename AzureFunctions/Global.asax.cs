using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Data;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Reflection;
using System.Web;
using System.Web.Hosting;
using System.Web.Http;
using System.Web.Http.ExceptionHandling;
using System.Web.Routing;
using Autofac;
using Autofac.Integration.WebApi;
using AzureFunctions.Authentication;
using AzureFunctions.Code;
using AzureFunctions.Contracts;
using AzureFunctions.Trace;
using Microsoft.ApplicationInsights;
using Microsoft.ApplicationInsights.Extensibility;
using Serilog;
using Serilog.Events;
using Serilog.Sinks.MSSqlServer;
using SerilogWeb.Classic.Enrichers;

namespace AzureFunctions
{
    public class Global : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            InitApplicationInsight();
            var container = InitAutofacContainer();

            var config = GlobalConfiguration.Configuration;
            config.Services.Add(typeof(IExceptionLogger), new TelemetryExceptionLogger());
            config.IncludeErrorDetailPolicy = IncludeErrorDetailPolicy.Always;
            config.DependencyResolver = new AutofacWebApiDependencyResolver(container);

            GlobalConfiguration.Configuration.Formatters.XmlFormatter.SupportedMediaTypes.Clear();
            InitLogging(container);
            RegisterRoutes(config);
        }

        private void InitApplicationInsight()
        {
            var key = Environment.GetEnvironmentVariable("aiInstrumentationKey");
            if (!string.IsNullOrEmpty(key))
            {
                TelemetryConfiguration.Active.InstrumentationKey = key;
                TelemetryConfiguration.Active.DisableTelemetry = false;
            }
            else
            {
                TelemetryConfiguration.Active.DisableTelemetry = true;
            }
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
            var settings = (ISettings)GlobalConfiguration.Configuration.DependencyResolver.GetService(typeof(ISettings));
            var clientConfig = settings.GetClientConfiguration();
            var runtimeType = (RuntimeType)Enum.Parse(typeof(RuntimeType), clientConfig.RuntimeType, true);

            if (context.Request.Url.AbsolutePath.Equals("/api/health", StringComparison.OrdinalIgnoreCase))
            {
                context.Response.WriteFile(HostingEnvironment.MapPath("~/health.html"));
                context.Response.StatusCode = 200;
                context.Response.Flush();
                context.Response.End();
                return;
            }

            if (context.Request.Url.AbsolutePath.Equals("/api/ping", StringComparison.OrdinalIgnoreCase))
            {
                context.Response.Write("success");
                context.Response.StatusCode = 200;
                context.Response.Flush();
                context.Response.End();
                return;
            }

            var isFile = FileSystemHelpers.FileExists(HostingEnvironment.MapPath($"~{context.Request.Url.AbsolutePath.Replace('/', '\\')}"));
            var route = RouteTable.Routes.GetRouteData(context);
            // If the route is not registerd in the WebAPI RouteTable
            //      then it's not an API route, which means it's a resource (*.js, *.css, *.cshtml), not authenticated.
            // If the route doesn't have authenticated value assume true
            var isAuthenticated = route != null && (route.Values["authenticated"] == null || (bool)route.Values["authenticated"]);
            // In some cases, context.Request.RawUrl may not be populated, but context.Request.UrlReferrer will be populated.
            // context.Request.UrlReferrer = null evals to true, is okay in this case
            //var isTryPageRequested = context.Request.RawUrl.EndsWith("/try", StringComparison.OrdinalIgnoreCase);

            var isTryPageRequested = context.Request.Params["trial"] == "true";
            //var isTryPageRequested = context.Request.RawUrl.Split(new char[] {'?'})[0].EndsWith("/try", StringComparison.OrdinalIgnoreCase);

            if (!isFile              //skip auth for files
                && runtimeType != RuntimeType.Standalone   // Skip auth for Standalone mode
                && !isTryPageRequested  //when requesting /try users can be unauthenticated
                && !SecurityManager.TryAuthenticateRequest(context)) // and if the user is not loggedon
            {
                if (isAuthenticated)
                {
                    context.Response.Headers["LoginUrl"] = SecurityManager.GetLoginUrl(context);
                    context.Response.StatusCode = 403; // Forbidden
                }
                // For OnPrem, the Functions portal will always be hosted as part of the Azure portal.
                // So we don't need to proactively redirect unauthenticated requests to the signin page.
                // Worry about authentication only when an unauthenticated call is made to a protected API.
                else if (settings.RuntimeType != RuntimeType.OnPrem && !context.Request.RawUrl.StartsWith("/api/"))
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

            builder.RegisterType<HttpClient>()
                .As<HttpClient>()
                .SingleInstance();

            builder.RegisterType<ArmClient>()
                .As<IArmClient>()
                .InstancePerRequest();

            builder.RegisterType<TemplatesManager>()
                .As<ITemplatesManager>()
                .SingleInstance();

            builder.RegisterType<DiagnosticsManager>()
                .As<IDiagnosticsManager>()
                .InstancePerRequest();

            builder.RegisterType<TelemetryClient>()
                .As<TelemetryClient>()
                .InstancePerRequest();

            builder.RegisterType<PassThroughRequestManager>()
                .As<IPassThroughRequestManager>()
                .InstancePerRequest();
        }

        private void RegisterRoutes(HttpConfiguration config)
        {
            config.Routes.MapHttpRoute("list-templates", "api/templates", new { controller = "AzureFunctions", action = "ListTemplates", authenticated = false }, new { verb = new HttpMethodConstraint(HttpMethod.Get.ToString()) });
            config.Routes.MapHttpRoute("get-binding-config", "api/bindingconfig", new { controller = "AzureFunctions", action = "GetBindingConfig", authenticated = false }, new { verb = new HttpMethodConstraint(HttpMethod.Get.ToString()) });

            config.Routes.MapHttpRoute("list-tenants", "api/tenants", new { controller = "ARM", action = "GetTenants", authenticated = true }, new { verb = new HttpMethodConstraint(HttpMethod.Get.ToString()) });
            config.Routes.MapHttpRoute("switch-tenants", "api/switchtenants/{tenantId}/{*path}", new { controller = "ARM", action = "SwitchTenants", authenticated = true }, new { verb = new HttpMethodConstraint(HttpMethod.Get.ToString()) });
            config.Routes.MapHttpRoute("get-token", "api/token", new { controller = "ARM", action = "GetToken", authenticated = true }, new { verb = new HttpMethodConstraint(HttpMethod.Get.ToString()) });

            config.Routes.MapHttpRoute("report-client-error", "api/clienterror", new { controller = "AzureFunctions", action = "ReportClientError", authenticated = false }, new { verb = new HttpMethodConstraint(HttpMethod.Post.ToString()) });
            config.Routes.MapHttpRoute("get-resources", "api/resources", new { controller = "AzureFunctions", action = "GetResources", authenticated = false }, new { verb = new HttpMethodConstraint(HttpMethod.Get.ToString()) });
            config.Routes.MapHttpRoute("get-latest-runtime", "api/latestruntime", new { controller = "AzureFunctions", action = "GetLatestRuntime", authenticated = false }, new { verb = new HttpMethodConstraint(HttpMethod.Get.ToString()) });

            config.Routes.MapHttpRoute("get-config", "api/config", new { controller = "AzureFunctions", action = "GetClientConfiguration", authenticated = false }, new { verb = new HttpMethodConstraint(HttpMethod.Get.ToString()) });

            config.Routes.MapHttpRoute("diagnose-app", "api/diagnose/{*armId}", new { controller = "AzureFunctions", action = "Diagnose", authenticated = false }, new { verb = new HttpMethodConstraint(HttpMethod.Post.ToString()) });

            config.Routes.MapHttpRoute("passthrough", "api/passthrough", new { controller = "AzureFunctions", action = "PassThrough", authrnticated = true }, new { verb = new HttpMethodConstraint(HttpMethod.Post.ToString()) });

            config.Routes.MapHttpRoute("get-runtime-token", "api/runtimeToken/{*armId}", new { controller = "AzureFunctions", action = "GetRuntimeToken", authenticated = false }, new { verb = new HttpMethodConstraint(HttpMethod.Get.ToString()) });
        }
    }
}