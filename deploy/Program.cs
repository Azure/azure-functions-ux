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
            var deploymentTempTarget = Path.GetTempFileName();
            const string toolsDirectory = @"D:\home\tools";
            const string ng = @"node_modules\.bin\ng";
            var yarn = Path.Combine(toolsDirectory, "yarn");
            var msBuild = @"%ProgramFiles(x86)%\MSBuild\14.0\Bin\MSBuild.exe".DoubleQuote();
            var assets = Path.Combine(deploymentSource, @"AzureFunctions.AngularClient\src\assets");

            Directory.CreateDirectory(deploymentTempTarget);
            Directory.CreateDirectory($@"{deploymentTarget}\ng-min");
            Directory.CreateDirectory($@"{deploymentTarget}\ng-full");

            DeploySdk
                .StandardDeployment
                .Call("npm", $"config set prefix {toolsDirectory}")
                .Call("npm", "install -g yarn")
                .Call("nuget", $"restore {deploymentSource}\\AzureFunctions.sln")
                .Call(msBuild, $@"{deploymentSource}\AzureFunctions\AzureFunctions.csproj /nologo /verbosity:m /t:Build /t:pipelinePreDeployCopyAllFilesToOneFolder /p:_PackageTempDir=""%DEPLOYMENT_TEMP%"";AutoParameterizationWebConfigConnectionStrings=false;Configuration=Release;UseSharedCompilation=false  /p:DeleteExistingFiles=False /p:SolutionDir=""{deploymentSource}\.\\"" %SCM_BUILD_ARGS%")
                .KuduSync()
                .ChangeDirectory($@"{deploymentSource}\AzureFunctions.AngularClient")
                .Call(yarn, "install", tries: 2)
                .Call("npm", "rebuild node-sass")
                .CleanAngularArtifacts()
                .Call(ng, $"build --progress false --prod --environment=prod --output-path=\"{deploymentTempTarget}\\ng-min\"", tries: 2)
                .Call(ng, $"build --progress false --output-path=\"{deploymentTempTarget}\\ng-full\"", tries: 2)
                .CopyDirectory($@"{deploymentTempTarget}\ng-min", $@"{deploymentTarget}\ng-min")
                .CopyDirectory($@"{deploymentTempTarget}\ng-full", $@"{deploymentTarget}\ng-full")
                .UpdateCshtml()
                .SetupTemplatesWebJob()
                .UpdateBuildTxt()
                .CopyFile($@"{assets}\googlecdaac16e0f037ee3.html", $@"{deploymentTarget}\googlecdaac16e0f037ee3.html")
                .CopyDirectory($@"{assets}\schemas", $@"{deploymentTarget}\schemas")
                .OnFail(EmailHelpers.EmailFailedRun)
                .OnSuccess(EmailHelpers.EmailSuccessfulRun)
                .Run();
        }
    }
}
