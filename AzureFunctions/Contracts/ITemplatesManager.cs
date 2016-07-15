using AzureFunctions.Models;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AzureFunctions.Contracts
{
    public interface ITemplatesManager
    {
        IEnumerable<FunctionTemplate> GetTemplates(string runtime);
        Task<JObject> GetBindingConfigAsync(string runtime);
        Task<Dictionary<string, string>> GetTemplateContentAsync(string templateId);        
    }
}
