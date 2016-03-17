using AzureFunctions.Models;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
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
