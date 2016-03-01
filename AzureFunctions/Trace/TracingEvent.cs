using Serilog.Events;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace AzureFunctions.Trace
{
    public class TracingEvent
    {
        public int EventId { get; set; }
        public string Message { get; set; }
        public LogEventLevel Level { get; set; } = LogEventLevel.Information;
    }
}