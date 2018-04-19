using System;

namespace Deploy.DeploymentSdk
{
    public class ParallelStep : IStep
    {
        private Func<IDeployment, IDeployment> calls;

        public ParallelStep(Func<IDeployment, IDeployment> calls)
        {
            this.calls = calls;
        }

        public RunOutcome Run()
        {
            return calls(new ParallelDeployment()).Run();
        }
    }
}