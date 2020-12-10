using System;
using System.Diagnostics.Tracing;
using System.IO;
using Newtonsoft.Json.Linq;

namespace TraceLoggingApp
{
    class Program
    {
        static void Main(string[] args)
        {
            string ProviderName = "TestTraceLoggingProvider";
            EventSource MybasicSource = new EventSource(ProviderName);

            Stream input = Console.OpenStandardInput();

            using (StreamReader sr = new StreamReader(input))
            {
                while (input.CanRead)
                {
                    try
                    {
                        string logString = sr.ReadLine();
                        if (logString != null)
                        {
                            JObject logObject = JObject.Parse(logString);
                            var eventName = logObject.Value<string>("eventName");
                            var name = logObject.Value<string>("name");
                            var properties = logObject.Property("properties")!.Value.ToString();
                            var data = new { name, properties };
                            MybasicSource.Write(eventName, data);

                            Console.WriteLine("Logging event [{0}]: {1}", eventName, data);
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
