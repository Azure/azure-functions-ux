using Newtonsoft.Json.Linq;
using System;
using System.Collections;
using System.Resources;
using System.Text;

namespace AzureFunctions.ResxConvertor
{
    public class ResxConvertor
    {
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

            //Close the reader.
            rsxr.Close();
        }

    }
}
