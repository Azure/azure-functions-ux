using AzureFunctions.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace AzureFunctions.Code
{
    public class ArmUriTemplates
    {
        private const string armApiVersion = "2014-04-01";
        private const string websitesApiVersion = "2015-02-01";

        public static readonly ArmUriTemplate Subscriptions = new ArmUriTemplate(Constants.CSMUrl + "/subscriptions", armApiVersion);
        public static readonly ArmUriTemplate Subscription = new ArmUriTemplate(Subscriptions.TemplateUrl + "/{subscriptionId}", armApiVersion);

        public static readonly ArmUriTemplate ResourceGroups = new ArmUriTemplate(Subscription.TemplateUrl + "/resourceGroups", armApiVersion);
        public static readonly ArmUriTemplate ResourceGroup = new ArmUriTemplate(ResourceGroups.TemplateUrl + "/{resourceGroupName}", armApiVersion);

        public static readonly ArmUriTemplate WebsitesRegister = new ArmUriTemplate(Subscription.TemplateUrl + "/providers/Microsoft.Web/register", websitesApiVersion);

        public static readonly ArmUriTemplate Sites = new ArmUriTemplate(ResourceGroup.TemplateUrl + "/providers/Microsoft.Web/sites", websitesApiVersion);
        public static readonly ArmUriTemplate Site = new ArmUriTemplate(Sites.TemplateUrl + "/{siteName}", websitesApiVersion);
        public static readonly ArmUriTemplate SitePublishingCredentials = new ArmUriTemplate(Site.TemplateUrl + "/config/PublishingCredentials/list", websitesApiVersion);
    }
}