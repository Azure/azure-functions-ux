using AzureFunctions.Common;
using Serilog;
using Serilog.Events;
using SerilogMetrics;
using System;
using System.Runtime.CompilerServices;

namespace AzureFunctions.Trace
{
    public static class FunctionsTrace
    {
        public static ILogger Diagnostics;
        public static ILogger Analytics;
        public static ILogger Performance;

        public static ITimedOperation BeginTimedOperation(string operationInfo = null, [CallerMemberName] string caller = null)
        {
            return Performance
                .BeginTimedOperation(
                    $"{caller}({operationInfo ?? string.Empty})",
                    completedMessage: Constants.CompletedOperationTemplate,
                    levelBeginning: LogEventLevel.Verbose,
                    levelCompleted: LogEventLevel.Information,
                    levelExceeds: LogEventLevel.Verbose);
        }
    }
}