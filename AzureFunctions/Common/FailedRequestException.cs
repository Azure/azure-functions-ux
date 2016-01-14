using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web;

namespace AzureFunctions.Common
{
    public class FailedRequestException : Exception
    {
        public Uri Uri { get; private set; }

        public string Content { get; private set; }

        public HttpStatusCode StatusCode { get; private set; }

        public FailedRequestException(Uri uri, string content, HttpStatusCode statusCode, string message)
            : base(message)
        {
            this.Uri = uri;
            this.Content = content;
            this.StatusCode = statusCode;
        }
    }
}