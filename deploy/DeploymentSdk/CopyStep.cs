using System;

namespace Deploy.DeploymentSdk
{
    public class CopyStep : CmdStep
    {
        private string source;
        private string destination;

        public CopyStep(string source, string destination, int tries = 1)
            : base("ROBOCOPY", $"\"{source}\" \"{destination}\" /E /IS", tries)
        {
            this.source = source;
            this.destination = destination;
        }

        public override RunOutcome Run()
        {
            var statusCode = base.InternalRun();
            return statusCode > 3
                ? RunOutcome.Failed
                : RunOutcome.Succeeded;
        }
    }
}