using System;
using System.Collections;
using System.Resources;

namespace AzureFunctions.ResxConvertor
{
    class Program
    {
        static void Main(string[] args)
        {
            var convertor = new ResxConvertor();
            convertor.SaveResxAsTypeScriptFile(new string[]{ args[0].ToString()}, args[1]);
        }
    }
}
