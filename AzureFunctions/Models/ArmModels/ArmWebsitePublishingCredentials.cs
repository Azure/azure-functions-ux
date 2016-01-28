using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace AzureFunctions.Models.ArmModels
{
    public class ArmWebsitePublishingCredentials
    {
        public string publishingUserName { get; set; }
        public string publishingPassword { get; set; }
    }
}