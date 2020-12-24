using System;
using System.Diagnostics;
using System.Diagnostics.Tracing;
using System.IO;
using Newtonsoft.Json.Linq;

namespace EtwLogger
{
    class Program
    {
        static void Main(string[] args)
        {
            string logFileName = String.Format("D:\\home\\site\\TraceLoggingApp\\TestTraceLoggingProvider_{0}.log", Process.GetCurrentProcess().Id);

            string providerName = args.Length > 0 ? args[0] : "EtwLogger";
            EventSource provider = new EventSource(providerName);

            try
            {
                System.IO.File.WriteAllText(logFileName, "ProviderName: " + providerName + "\r\n");
            }
            catch (Exception e)
            {

            }

            Stream input = Console.OpenStandardInput();

            using (StreamReader streamReader = new StreamReader(input))
            {
                while (input.CanRead)
                {
                    try
                    {
                        string logString = streamReader.ReadLine();
                        if (logString != null)
                        {
                            JObject logObject = JObject.Parse(logString);
                            var eventName = logObject.Value<string>("eventName");
                            var name = logObject.Value<string>("name");
                            var customDimensions = logObject.Property("customDimensions")!.Value.ToString();
                            var data = new { name, customDimensions };
                            provider.Write(eventName, data);

                            System.IO.File.AppendAllText(logFileName, String.Format("Logging event [{0}]: {1}\r\n", eventName, data));
                        }
                    }
                    catch (Exception e)
                    {
                        Console.Error.WriteLine("Exception Logging event: {0}", e);

                        System.IO.File.AppendAllText(logFileName, String.Format("Exception Logging event: {0}\r\n", e));
                    }
                }
            }
        }
    }
}
