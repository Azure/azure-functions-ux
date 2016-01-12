using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace AzureFunctions.Models.ArmModels
{
    public class ArmArrayWrapper<T>
    {
        public ArmWrapper<T>[] value { get; set; }
    }
}