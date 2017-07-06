using System;
using System.IO;

namespace Deploy.DeploymentSdk
{
    internal class CopyFileStep : IStep
    {
        private string _source;
        private string _destination;
        private bool _overwrite;

        public CopyFileStep(string source, string destination, bool overwrite)
        {
            this._source = source;
            this._destination = destination;
            this._overwrite = overwrite;
        }

        public RunOutcome Run()
        {
            try
            {
                File.Copy(_source, _destination, _overwrite);
                return RunOutcome.Succeeded;
            }
            catch (Exception e)
            {
                StaticLogger.WriteErrorLine($"Error copying {_source} to {_destination}");
                StaticLogger.WriteErrorLine(e.ToString());
                return RunOutcome.Failed;
            }
        }
    }
}