using Serilog.Core;
using Serilog.Events;

namespace AzureFunctions.Trace
{
    public class EventIdEnricher : ILogEventEnricher
    {
        public void Enrich(LogEvent logEvent, ILogEventPropertyFactory propertyFactory)
        {
            logEvent.AddPropertyIfAbsent(propertyFactory.CreateProperty(FunctionsTrace.EventId, -1));
        }
    }
}