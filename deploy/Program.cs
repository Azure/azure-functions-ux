using System.IO;
using Deploy.DeploymentSdk;
using Deploy.Extensions;
using Deploy.Helpers;

namespace Deploy
{
    class Program
    {
        static void Main(string[] args)
        {
            const string deploymentSource = @"D:\home\site\repository";
            const string deploymentTarget = @"D:\home\site\wwwroot";
            const string toolsDirectory = @"D:\home\tools";
            const string ng = @"node_modules\.bin\ng";
            var yarn = Path.Combine(toolsDirectory, "yarn");
            var msBuild = @"%ProgramFiles(x86)%\MSBuild\14.0\Bin\MSBuild.exe".DoubleQuote();

            DeploySdk
                .StandardDeployment
                .Call("npm", $"config set prefix {toolsDirectory}")
                .Call("npm", "install -g yarn")
                .Call("nuget", $"restore {deploymentSource}\\AzureFunctions.sln")
                .Call(msBuild, $@"{deploymentSource}\AzureFunctions\AzureFunctions.csproj /nologo /verbosity:m /t:Build /t:pipelinePreDeployCopyAllFilesToOneFolder /p:_PackageTempDir=""%DEPLOYMENT_TEMP%"";AutoParameterizationWebConfigConnectionStrings=false;Configuration=Release;UseSharedCompilation=false  /p:DeleteExistingFiles=False /p:SolutionDir=""{deploymentSource}\.\\"" %SCM_BUILD_ARGS%")
                .ChangeDirectory($@"{deploymentSource}\AzureFunctions.AngularClient")
                .Call(yarn, "install", tries: 2)
                .Call("npm", "rebuild node-sass")
                .ParallelCall(p => p
                   .Call(ng, "build --prod --environment=prod --output-path=\"%ARTIFACTS%\\dist\\opt\"", tries: 2)
                   .Call(ng, "build --output-path=\"%ARTIFACTS%\\dist\\notopt\"", tries: 2)
                )
                .CleanAngularArtifacts()
                .CopyDirectory("%ARTIFACTS%\\dist\\opt", "%DEPLOYMENT_TEMP%")
                .CopySwaggerFiles()
                .KuduSync()
                .UpdateCshtml()
                .SetupTemplatesWebJob()
                .UpdateBuildTxt()
                .CopyFile($@"{deploymentSource}\AzureFunctions.AngularClient\src\assets\googlecdaac16e0f037ee3.html", $@"{deploymentTarget}\googlecdaac16e0f037ee3.html")
                .OnFail(EmailHelpers.EmailFailedRun)
                .OnSuccess(EmailHelpers.EmailSuccessfulRun)
                .Run();
        }
    }
}
