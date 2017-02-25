using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using AzureFunctions.Common;
using AzureFunctions.Contracts;
using AzureFunctions.Models;
using Newtonsoft.Json;

namespace AzureFunctions.Code
{
    public class ArmClient : IArmClient
    {
        private readonly HttpClient _client;
        private readonly IUserSettings _userSettings;

        public ArmClient(HttpClient client, IUserSettings userSettings)
        {
            _client = client;
            _userSettings = userSettings;
        }

        public Task<MaybeResultOrError<T, HttpResponseMessage>> Get<T>(string armId, string apiVersion)
            where T : class
        {
            var request = GetRequestObject(armId, apiVersion, HttpMethod.Get);
            return Execute<T>(request);
        }

        public Task<MaybeResultOrError<T, HttpResponseMessage>> Get<T>(Uri uri, Dictionary<string, string> headers = null)
            where T : class
        {
            var request = GetRequestObject(uri, HttpMethod.Get, headers);
            return Execute<T>(request);
        }

        public Task<MaybeResultOrError<T, HttpResponseMessage>> Post<T>(string armId, string apiVersion, object payload = null)
            where T : class
        {
            var request = GetRequestObject(armId, apiVersion, HttpMethod.Post, payload);
            return Execute<T>(request);
        }

        public Task<MaybeResultOrError<T, HttpResponseMessage>> Put<T>(string armId, string apiVersion, object payload = null)
            where T : class
        {
            var request = GetRequestObject(armId, apiVersion, HttpMethod.Put, payload);
            return Execute<T>(request);
        }

        private async Task<MaybeResultOrError<T, HttpResponseMessage>> Execute<T>(HttpRequestMessage request) where T : class
        {
            try
            {
                var response = await _client.SendAsync(request);
                if ((int)response.StatusCode >= 200 && (int)response.StatusCode < 300)
                {
                    return typeof(T) == typeof(string)
                        ? new MaybeResultOrError<T, HttpResponseMessage>(true, await response.Content.ReadAsStringAsync() as T, null)
                        : new MaybeResultOrError<T, HttpResponseMessage>(true, await response.Content.ReadAsAsync<T>(), null);
                }
                else
                {
                    return new MaybeResultOrError<T, HttpResponseMessage>(false, default(T), response);
                }
            }
            catch (Exception e)
            {
                return new MaybeResultOrError<T, HttpResponseMessage>(false, default(T), new HttpResponseMessage
                {
                    Content = new StringContent(JsonConvert.SerializeObject(e)),
                    ReasonPhrase = e.Message
                });
            }
        }

        private HttpRequestMessage GetRequestObject(string armId, string apiVersion, HttpMethod method, object payload = null)
        {
            var uri = new Uri(new Uri("https://management.azure.com"), $"{armId}?api-version={apiVersion}");
            return GetRequestObject(uri, method, payload: payload);
        }

        private HttpRequestMessage GetRequestObject(Uri uri, HttpMethod method, Dictionary<string, string> headers = null, object payload = null)
        {
            var req = new HttpRequestMessage(method, uri);
            req.Headers.TryAddWithoutValidation("Authorization", $"Bearer {_userSettings.BearerToken}");
            req.Headers.TryAddWithoutValidation("User-Agent", Constants.UserAgent);
            req.Headers.TryAddWithoutValidation("Accepts", Constants.ApplicationJson);
            if (headers != null)
            {
                foreach (var pair in headers)
                {
                    req.Headers.TryAddWithoutValidation(pair.Key, pair.Value);
                }
            }

            if (payload != null)
            {
                var payloadStr = JsonConvert.SerializeObject(payload);
                req.Content = new StringContent(payloadStr, Encoding.UTF8, Constants.ApplicationJson);
            }
            return req;
        }
    }
}