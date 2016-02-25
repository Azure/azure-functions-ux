using AzureFunctions.Models;
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
    }
}
