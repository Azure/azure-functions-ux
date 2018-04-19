using System;

namespace Deploy.DeploymentSdk
{
    public class CopyDirectoryStep : CmdStep
    {
        private string source;
        private string destination;

        public CopyDirectoryStep(string source, string destination, int tries = 1)
            : base("ROBOCOPY", $"\"{source}\" \"{destination}\" /PURGE /MIR", tries)
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