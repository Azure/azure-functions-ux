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
            convertor.SaveResxAsTypeScriptFile(args[0], args[1]);
        }
    }
}
