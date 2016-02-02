using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace AzureFunctions.Models
{
    public class FunctionContainer
    {
        public string ScmUrl { get; set; }
        public string BasicAuth { get; set; }
        public string Bearer { get; set; }
    }
}