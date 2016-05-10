using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace AzureFunctions.Authentication
{
    public static class ClaimTypes
    {
        public const string Email = "email";
        public const string UniqueName = "unique_name";
        public const string Name = "name";
        public const string GivenName = "given_name";
    }
}