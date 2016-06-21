using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace AzureFunctions.Models
{
    public enum AppService
    {
        Web = 0,
        Mobile = 1,
        Api = 2,
        Logic = 3,
        Function = 4
    }
}