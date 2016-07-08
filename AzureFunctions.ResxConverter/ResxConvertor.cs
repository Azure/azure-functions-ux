using Newtonsoft.Json.Linq;
using System;
using System.Collections;
using System.Resources;
using System.Text;

namespace AzureFunctions.ResxConvertor
{
    public class ResxConvertor
    {
        public JObject ConvertResxToJObject(string resxFilePath)
        {
            // Create a ResXResourceReader for the file items.resx.
            ResXResourceReader rsxr = new ResXResourceReader(resxFilePath);

            var jo = new JObject();

            // Iterate through the resources and display the contents to the console.
            foreach (DictionaryEntry d in rsxr)
            {                
                jo[d.Key.ToString()] = d.Value.ToString();
            }

            //Close the reader.
            rsxr.Close();

            return jo;
        }

        public void SaveResxAsTypeScriptFile(string resxFilePath, string outputTSFilePAth)
        {
            var sb = new StringBuilder();
            sb.AppendLine("// This file is auto generated");
            sb.AppendLine("");
            sb.AppendLine("export class PortalResources");
            sb.AppendLine("{");

            ResXResourceReader rsxr = new ResXResourceReader(resxFilePath);
            foreach (DictionaryEntry d in rsxr)
            {
                sb.AppendLine(string.Format("    public static {0}: string = \"{0}\";", d.Key.ToString()));
            }

            sb.AppendLine("}");

            using (System.IO.StreamWriter file = new System.IO.StreamWriter(outputTSFilePAth))
            {
                file.WriteLine(sb.ToString());
            }                
        }

    }
}
