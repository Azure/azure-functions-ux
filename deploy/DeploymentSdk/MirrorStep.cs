namespace Deploy.DeploymentSdk
{
    internal class MirrorStep : CmdStep
    {
        private string _source;
        private string _destination;

        public MirrorStep(string source, string destination, int tries = 1)
            : base("ROBOCOPY", $"\"{source}\" \"{destination}\" /MIR", tries)
        {
            _source = source;
            _destination = destination;
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