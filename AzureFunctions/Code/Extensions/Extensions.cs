using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace AzureFunctions.Code.Extensions
{
    public static class Extensions
    {
        public static string NullStatus(this object o)
        {
            return o == null ? "Null" : "NotNull";
        }
    }
}