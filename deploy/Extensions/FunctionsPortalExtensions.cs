using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Deploy.DeploymentSdk;

namespace Deploy.Extensions
{
    public static class FunctionsPortalExtensions
    {
        private static readonly IEnumerable<(string pattern, string template)> _optimizedAngularArtifacts = new []
        {
            ("inline.*.bundle.js", "{{INLINE}}"),
            ("polyfills.*.bundle.js", "{{POLYFILLS}}"),
            ("scripts.*.bundle.js", "{{SCRIPTS}}"),
            ("vendor.*.bundle.js", "{{VENDOR}}"),
            ("main.*.bundle.js", "{{MAIN}}"),
            ("styles.*.bundle.css", "{{STYLES}}")
        };

        private static readonly IEnumerable<string> _notOptimizedAngularArtifacts = new []
        {
            "inline.bundle.js",
            "polyfills.bundle.js",
            "scripts.bundle.js",
            "vendor.bundle.js",
            "main.bundle.js",
            "styles.bundle.js"
        };

        private static readonly string _wwwroot = Environment.ExpandEnvironmentVariables(@"%HOME%\site\wwwroot");

        public static IDeployment CleanAngularArtifacts(this IDeployment deployment)
        {
            return deployment.AddStep(() =>
            {
                var minPath = Path.Combine(_wwwroot, "ng-min");
                if (Directory.Exists(minPath))
                {
                    foreach (var pattern in _optimizedAngularArtifacts.Select(t => t.pattern).Concat(_notOptimizedAngularArtifacts))
                    {
                        foreach (var file in Directory.GetFiles(minPath, pattern, SearchOption.TopDirectoryOnly))
                        {
                            File.Delete(file);
                        }
                    }
                }
            }, name: nameof(CleanAngularArtifacts));
        }

        public static IDeployment UpdateCshtml(this IDeployment deployment)
        {
            return deployment.AddStep(() =>
            {
                var cshtmlFile = Path.Combine(_wwwroot, "Views", "_Azure.cshtml");
                var cshtml = File.ReadAllText(cshtmlFile);
                foreach ((var pattern, var template) in _optimizedAngularArtifacts)
                {
                    var file = Directory.GetFiles(Path.Combine(_wwwroot, "ng-min"), pattern, SearchOption.TopDirectoryOnly).Single();
                    cshtml = cshtml.Replace(template, Path.GetFileName(file));
                }
                File.WriteAllText(cshtmlFile, cshtml);
            }, name: nameof(UpdateCshtml));
        }

        public static IDeployment SetupTemplatesWebJob(this IDeployment deployment)
        {
            return deployment.AddStep(() =>
            {
                var webJobPath = Path.Combine(_wwwroot, @"App_Data\jobs\triggered\templates-update");
                Directory.CreateDirectory(webJobPath);

                if (File.Exists(Path.Combine(webJobPath , "templates-update.cmd")))
                {
                    File.Delete(Path.Combine(webJobPath , "templates-update.cmd"));
                }

                var file1 = Environment.ExpandEnvironmentVariables(@"%DEPLOYMENT_SOURCE%\WebJobs\templates-update\templates-update.ps1");
                var file2 = Environment.ExpandEnvironmentVariables(@"%DEPLOYMENT_SOURCE%\WebJobs\templates-update\settings.job");
                File.Copy(file1, Path.Combine(webJobPath, Path.GetFileName(file1)), overwrite: true);
                File.Copy(file2, Path.Combine(webJobPath, Path.GetFileName(file2)), overwrite: true);
            }, name: nameof(SetupTemplatesWebJob));
        }

        public static IDeployment UpdateBuildTxt(this IDeployment deployment)
        {
            return deployment.AddStep(() =>
            {
                var file = Path.Combine(_wwwroot, "build.txt");
                File.WriteAllText(file, Environment.GetEnvironmentVariable("SCM_COMMIT_ID"));
            }, name: nameof(UpdateBuildTxt));
        }
    }
}