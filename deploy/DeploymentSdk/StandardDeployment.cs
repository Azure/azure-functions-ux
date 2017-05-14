using System;
using System.Collections.Generic;
using System.Linq;
using Deploy.DeploymentSdk;

namespace Deploy.DeploymentSdk
{
    public class StandardDeployment : IDeployment
    {
        protected IList<(IStep step, bool stopOnError)> script = new List<(IStep, bool)>();
        protected Action _onFail;
        protected Action _onSuccess;
        public IDeployment AddStep(Action run, bool stopOnError = true, string name = null)
        {
            script.Add((new ActionStep(run, name), stopOnError));
            return this;
        }

        public IDeployment Call(string program, string args, int tries = 1, bool stopOnError = true)
        {
            script.Add((new CmdStep(program, args, tries), stopOnError));
            return this;
        }

        public IDeployment ChangeDirectory(string directory)
        {
            script.Add((new ChangeDirectoryStep(directory), true));
            return this;
        }

        public IDeployment Copy(string source, string destination)
        {
            script.Add((new CopyStep(source, destination), true));
            return this;
        }

        public IDeployment OnFail(Action action)
        {
            this._onFail = action;
            return this;
        }

        public IDeployment OnSuccess(Action action)
        {
            this._onSuccess = action;
            return this;
        }

        public IDeployment ParallelCall(Func<IDeployment, IDeployment> calls)
        {
            script.Add((new ParallelStep(calls), true));
            return this;
        }

        public IDeployment Publish()
        {
            script.Add((new PublishStep(), true));
            return this;
        }

        public virtual RunOutcome Run()
        {
            if (script.Any())
            {
                foreach ((var step, var stopOnError) in script)
                {
                    var result = step.Run();
                    if (result == RunOutcome.Failed && stopOnError)
                    {
                        this._onFail?.Invoke();
                        return RunOutcome.Failed;
                    }
                }
                this._onSuccess?.Invoke();
            }
            return RunOutcome.Succeeded;
        }
    }
}