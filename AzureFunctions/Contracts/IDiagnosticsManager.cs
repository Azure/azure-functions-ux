using System.Collections.Generic;
using System.Threading.Tasks;
using AzureFunctions.Models;

namespace AzureFunctions.Contracts
{
    public interface IDiagnosticsManager
    {
        Task<IEnumerable<DiagnosticsResult>> Diagnose(string armId);

        // HACK: this is temporary until ANT68
        Task<(bool, string)> GetRuntimeToken(string armId);
    }
}