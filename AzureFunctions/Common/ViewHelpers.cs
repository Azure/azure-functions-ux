using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.WebPages;
using HtmlAgilityPack;

namespace AzureFunctions.Common
{
    public static class ViewHelpers
    {
        private static readonly IDictionary<View, string> ViewNameMap = new Dictionary<View, string>
        {
            { View.Azure, "~/Views/_Azure.cshtml" },
            { View.Local, "~/Views/_Local.cshtml" },
            { View.OnPrem, "~/Views/_OnPrem.cshtml" },
            { View.Base, "~/Views/_Base.cshtml" }
        };

        private static readonly HtmlString DefaultHtmlString = new HtmlString("Error loading view");

        public static HtmlString RenderHead(WebPage page, View view)
        {
            return RenderPageAndExtractElement(page, view, "head");
        }

        public static HtmlString RenderBody(WebPage page, View view)
        {
            return RenderPageAndExtractElement(page, view, "body");
        }

        private static HtmlString RenderPageAndExtractElement(WebPage page, View view, string elementName)
        {
            string renderedPage = page.RenderPage(ViewNameMap[view]).ToHtmlString();
            var htmlPage = new HtmlDocument();
            htmlPage.LoadHtml(renderedPage);
            var elementHtml = htmlPage.DocumentNode.Descendants(elementName).FirstOrDefault()?.InnerHtml;
            return string.IsNullOrEmpty(elementHtml) ? DefaultHtmlString : new HtmlString(elementHtml);
        }
    }
}