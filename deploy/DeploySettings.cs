using System;
using System.Runtime.CompilerServices;

namespace Deploy
{
    public static class DeploySettings
    {
        private static string config(string @default = null, [CallerMemberName] string key = null)
        {
            var value = System.Environment.GetEnvironmentVariable(key);
            return string.IsNullOrEmpty(value)
                ? @default
                : value;
        }

        public static string ToEmailList => config();

        public static string FromEmail => config();

        public static string EmailServer => config();

        public static string EmailUserName => config();

        public static string EmailPassword => config();

        public static string AppName => config(null, "WEBSITE_SITE_NAME");

    }
}