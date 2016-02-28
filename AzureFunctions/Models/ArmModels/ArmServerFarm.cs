using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace AzureFunctions.Models.ArmModels
{
    public class ArmServerFarm
    {
        public string resourceGroup { get; set; }
        public string geoRegion { get; set; }
    }
}