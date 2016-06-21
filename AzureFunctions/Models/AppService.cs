using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace AzureFunctions.Models
{
    public enum AppService
    {
        Web = 0,
        Mobile,
        Api,
        Logic,
        Function
    }
}