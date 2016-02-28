using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace AzureFunctions.Contracts
{
    public interface IUserSettings
    {
        string BearerToken { get; }
    }
}