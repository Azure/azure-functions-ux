using System;

namespace Deploy.DeploymentSdk
{
    public interface IDeployment
    {
        IDeployment Call(string program, string args, int tries = 1, bool stopOnError = true);
        IDeployment ChangeDirectory(string directory);
        IDeployment ParallelCall(Func<IDeployment, IDeployment> calls);
        IDeployment Copy(string source, string destination);
        IDeployment Publish();
        IDeployment AddStep(Action run, bool stopOnError = true, string name = null);
        IDeployment OnSuccess(Action action);
        IDeployment OnFail(Action action);
        RunOutcome Run();
    }
}