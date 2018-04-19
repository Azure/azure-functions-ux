using System;

namespace Deploy.DeploymentSdk
{
    public class KuduSyncStep : CmdStep
    {
        public KuduSyncStep(int tries = 1)
            : base("%KUDU_SYNC_CMD%", "-v 50 -f \"%DEPLOYMENT_TEMP%\" -t \"%DEPLOYMENT_TARGET%\" -n \"%NEXT_MANIFEST_PATH%\" -p \"%PREVIOUS_MANIFEST_PATH%\" -i \".git;.hg;.deployment;deploy.cmd\"", tries)
        {
        }
    }
}