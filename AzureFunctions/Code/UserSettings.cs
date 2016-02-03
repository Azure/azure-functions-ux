using AzureFunctions.Common;
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

        public string BearerToken
        {
            get
            {
                return this._currentRequest.Headers.GetValues(Constants.X_MS_OAUTH_TOKEN).FirstOrDefault();
            }
        }
    }
}