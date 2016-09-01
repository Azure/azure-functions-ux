using System.Web.Http.ExceptionHandling;
using Microsoft.ApplicationInsights;

namespace AzureFunctions.Code
{
    public class TelemetryExceptionLogger : ExceptionLogger
    {
        private readonly TelemetryClient _telemetryClient;

        public TelemetryExceptionLogger()
        {
            _telemetryClient = new TelemetryClient();
        }

        public override void Log(ExceptionLoggerContext context)
        {
            _telemetryClient.TrackException(context.Exception);
        }
    }
}