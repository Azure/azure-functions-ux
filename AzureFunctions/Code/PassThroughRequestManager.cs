using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using AzureFunctions.Contracts;
using AzureFunctions.Models;
using Newtonsoft.Json;

namespace AzureFunctions.Code
{
    public class PassThroughRequestManager : IPassThroughRequestManager
    {
        private static readonly HttpClient _httpClient = new HttpClient
        {
            Timeout = TimeSpan.FromMinutes(3)
        };

        private static readonly IEnumerable<string> ContentHeaders = new []
        {
            "Content-Disposition",
            "Content-Encoding",
            "Content-Language",
            "Content-Length",
            "Content-Location",
            "Content-MD5",
            "Content-Range",
            "Content-Type"
        };

        public async Task<HttpResponseMessage> HandleRequest(RequestObject clientRequest)
        {
            var cts = new CancellationTokenSource();
            try
            {
                var request = CreateRequestObject(clientRequest);
                return await _httpClient.SendAsync(request, cts.Token);
            }
            catch (TaskCanceledException ex)
            {
                var statusCode = ex.CancellationToken != cts.Token
                    ? HttpStatusCode.GatewayTimeout
                    : HttpStatusCode.BadRequest;
                return new HttpResponseMessage(statusCode)
                {
                    Content = new StringContent(JsonConvert.SerializeObject(new
                    {
                        reason = "PassThrough",
                        exception = ex
                    }), Encoding.UTF8, "application/json")
                };
            }
            catch (Exception e)
            {
                return new HttpResponseMessage(HttpStatusCode.BadRequest)
                {
                    Content = new StringContent(JsonConvert.SerializeObject(new
                    {
                        reason = "PassThrough",
                        exception = e
                    }), Encoding.UTF8, "application/json")
                };
            }
        }

        private HttpRequestMessage CreateRequestObject(RequestObject clientRequest)
        {
            var request = new HttpRequestMessage
            {
                RequestUri = new Uri(clientRequest.Url),
                Method = new HttpMethod(clientRequest.Method),
            };

            var contentHeaders = clientRequest.Headers == null
                ? Enumerable.Empty<(string, string)>()
                : clientRequest.Headers
                    .Where(kv => ContentHeaders.Any(ch => ch.Equals(kv.Key, StringComparison.OrdinalIgnoreCase)))
                    .Select(kv => (kv.Key, kv.Value));

            var requestHeaders = clientRequest.Headers == null
                ? Enumerable.Empty<(string, string)>()
                : clientRequest.Headers
                    .Where(kv => !ContentHeaders.Any(ch => ch.Equals(kv.Key, StringComparison.OrdinalIgnoreCase)))
                    .Select(kv => (kv.Key, kv.Value));

            (var _, var contentType) = contentHeaders.FirstOrDefault(p => p.Item1.Equals("Content-Type", StringComparison.OrdinalIgnoreCase));

            if (request.Method != HttpMethod.Get && !string.IsNullOrEmpty(clientRequest.Body))
            {
                request.Content = new StringContent(clientRequest.Body, Encoding.UTF8, contentType);
                foreach ((var name, var value) in contentHeaders)
                {
                    if (!name.Equals("Content-Type", StringComparison.OrdinalIgnoreCase))
                    {
                        request.Content.Headers.TryAddWithoutValidation(name, value);
                    }
                }
            }

            foreach ((var name, var value) in requestHeaders)
            {
                request.Headers.TryAddWithoutValidation(name, value);
            }

            return request;
        }
    }
}