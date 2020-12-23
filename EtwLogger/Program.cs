using System;
using System.Diagnostics.Tracing;
using System.IO;
using Newtonsoft.Json.Linq;

namespace EtwLogger
{
    class Program
    {
        static void Main(string[] args)
        {
            string providerName = args.Length > 0 ? "EtwLogger" :  args[0];
            EventSource provider = new EventSource(providerName);

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
                        }
                    }
                    catch (Exception e)
                    {
                        Console.Error.WriteLine("Exception Logging event: {0}", e);
                    }
                }
            }
        }
    }
}
