using AzureFunctions.Models;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AzureFunctions.Contracts
{
    public interface ITemplatesManager
    {
        IEnumerable<FunctionTemplate> GetTemplates();
        Task<JObject> GetBindingConfigAsync();
        Task<Dictionary<string, string>> GetTemplateContentAsync(string templateId);        
    }
}
