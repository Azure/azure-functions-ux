using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace AzureFunctions.Models.ArmModels
{
    public class ArmWebsite
    {
        public string[] hostNames { get; set; }
        public string[] enabledHostNames { get; set; }
    }
}