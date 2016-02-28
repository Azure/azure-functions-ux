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
                var headerValues = this._currentRequest.Headers.GetValues(Constants.ClientTokenHeader);
                var token = headerValues != null ? headerValues.FirstOrDefault() : null;
                if (token == null)
                {
                    headerValues = this._currentRequest.Headers.GetValues(Constants.X_MS_OAUTH_TOKEN);
                    token = headerValues != null ? headerValues.FirstOrDefault() : null;
                }

                return token;
            }
        }
    }
}