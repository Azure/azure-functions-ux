using System;
using System.Diagnostics;
using System.Diagnostics.Tracing;
using System.IO;
using Newtonsoft.Json.Linq;

namespace TraceLoggingApp
{
    class Program
    {
        static void Main(string[] args)
        {
            string logFileName = String.Format("D:\\home\\site\\TraceLoggingApp\\TestTraceLoggingProvider_{0}.log", Process.GetCurrentProcess().Id);
            System.IO.File.WriteAllText(logFileName, "START\r\n");

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

                            try
                            {
                                Console.WriteLine("Logging event [{0}]: {1}", eventName, data);
                                System.IO.File.AppendAllText(logFileName, String.Format("Logging event [{0}]: {1}\r\n", eventName, data));
                            }
                            catch (Exception e)
                            {
                                //
                            }
                        }
                    }
                    catch (Exception e)
                    {
                        try
                        {
                            Console.Error.WriteLine("Exception Logging event: {0}", e);
                            System.IO.File.AppendAllText(logFileName, String.Format("Exception Logging event: {0}\r\n", e));
                        }
                        catch (Exception e1)
                        {
                            //
                        }
                    }
                }
            }
        }
    }
}
