using AzureFunctions.Common;
using Serilog;
using Serilog.Core;
using Serilog.Events;
using SerilogMetrics;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;

namespace AzureFunctions.Trace
{
    public static class FunctionsTrace
    {
        public static ILogger Diagnostics;
        public static ILogger Analytics;
        public static ILogger Performance;
        public const string EventId = "EventId";

        public static void Event(this ILogger logger, TracingEvent tracingEvent, params object [] properties)
        {
            logger.Write(tracingEvent.Level, $"{tracingEvent.Message} {{{EventId}}}", properties, tracingEvent.EventId);
        }

        public static ITimedOperation BeginTimedOperation(string operationInfo = null, [CallerMemberName] string caller = null)
        {
            return Performance
                .BeginTimedOperation(
                    $"{caller}({operationInfo ?? string.Empty})",
                    completedMessage: TracingEvents.CompletedOperationTemplate.Message,
                    levelBeginning: LogEventLevel.Verbose,
                    levelCompleted: LogEventLevel.Information,
                    levelExceeds: LogEventLevel.Verbose);
        }
    }
}