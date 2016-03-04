using Serilog.Events;

namespace AzureFunctions.Trace
{
    public static class TracingEvents
    {
        // EventId = 0
        public static readonly TracingEvent ErrorInGetFunctionTemplate = new TracingEvent
        {
            Message = "TemplatesManager.GetFunctionTemplate({templateFolderName}), {Exception}",
            EventId = 0
        };

        // EventId = 1
        public static readonly TracingEvent ErrorInGetFunctionContainer = new TracingEvent
        {
            Message = "AzureFunctionsController.GetFunctionContainer()",
            EventId = 1
        };

        // EventId = 2
        public static readonly TracingEvent ErrorInCreateFunctionsContainer = new TracingEvent
        {
            Message = "AzureFunctionsController.CreateFunctionsContainer({subscriptionId}, {location}, {serverFarmId}) {Exception}",
            EventId = 2
        };

        // EventId = 3
        public static readonly TracingEvent ErrorInCreateTrialFunctionContainer = new TracingEvent
        {
            Message = "CreateTrialFunctionsContainer() {Exception}",
            EventId = 3
        };

        // EventId = 4
        public static readonly TracingEvent CompletedOperationTemplate = new TracingEvent
        {
            Message = "Completed {TimedOperationId}: {OperationName} started {StartedTime} in {TimedOperationElapsed} ({TimeTakenMsec} ms) {OperationResult}",
            EventId = 4
        };

        // EventId = 5
        public static readonly TracingEvent UserForbidden = new TracingEvent
        {
            Message = "User {UserName} got 403 (Forbidden)",
            EventId = 5
        };

        public static readonly TracingEvent ClientError = new TracingEvent
        {
            Message = "{ErrorMessage}, {StackTrace}",
            EventId = 6,
            Level = LogEventLevel.Error
        };
    }
}