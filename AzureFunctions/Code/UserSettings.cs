using AzureFunctions.Contracts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace AzureFunctions.Code
{
    public class UserSettings : IUserSettings
    {
        private HttpRequestBase _currentRequest;

        public UserSettings(HttpRequestBase currentRequest)
        {
            this._currentRequest = currentRequest;
        }
    }
}