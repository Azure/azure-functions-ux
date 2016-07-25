using Newtonsoft.Json.Linq;
using System;
using System.Collections;
using System.IO;
using System.Resources;
using System.Text;

namespace AzureFunctions.ResxConvertor
{
    public class ResxConvertor
    {
        public void SaveResxAsTypeScriptFile(string[] resxFiles, string outputTSFilePAth)
        {
            var sb = new StringBuilder();
            sb.AppendLine("// This file is auto generated");
            sb.AppendLine("");
            sb.AppendLine("export class PortalResources");
            sb.AppendLine("{");

            foreach (var resxFile in resxFiles)
            {
                if (File.Exists(resxFile))
                {

                    ResXResourceReader rsxr = new ResXResourceReader(resxFile);
                    foreach (DictionaryEntry d in rsxr)
                    {
                        sb.AppendLine(string.Format("    public static {0}: string = \"{0}\";", d.Key.ToString()));
                    }

                    //Close the reader.
                    rsxr.Close();
                }
            }
            sb.AppendLine("}");

            using (System.IO.StreamWriter file = new System.IO.StreamWriter(outputTSFilePAth))
            {
                file.WriteLine(sb.ToString());
            }
        }

    }
}
