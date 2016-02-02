using AzureFunctions.Contracts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace AzureFunctions.Code
{
    public class ArmManager : IArmManager
    {
        private IUserSettings _userSettings;

        public ArmManager(IUserSettings userSettings)
        {
            this._userSettings = userSettings;
        }
    }
}