using AzureFunctions.Common;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Web;

namespace AzureFunctions.Models.ArmResources
{
    public class ResourceGroup : BaseResource
    {
        private const string _csmIdTemplate = "/subscriptions/{0}/resourceGroups/{1}";

        public override string ArmId
        {
            get
            {
                return string.Format(CultureInfo.InvariantCulture, _csmIdTemplate, SubscriptionId, ResourceGroupName);
            }
        }

        public Site FunctionsSite { get; set; }
        public StorageAccount FunctionsStorageAccount { get; set; }

        public Dictionary<string, string> Tags { get; set; }
        public string Location { get; private set; }

        public ResourceGroup(string subsciptionId, string resourceGroupName, string location)
            : base(subsciptionId, resourceGroupName)
        {
            this.Tags = new Dictionary<string, string>();
            this.Location = location;
        }
    }
}