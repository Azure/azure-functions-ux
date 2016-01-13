using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace AzureFunctions.Models.ArmModels
{
    public class ArmStorage
    {
        public string accountType { get; set; }
        public string provisioningState { get; set; }
    }
}