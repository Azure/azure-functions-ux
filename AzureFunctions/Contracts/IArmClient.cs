using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using AzureFunctions.Models;

namespace AzureFunctions.Contracts
{
    public interface IArmClient
    {
        Task<MaybeResultOrError<T, HttpResponseMessage>> Get<T>(string armId, string apiVersion) where T : class;
        Task<MaybeResultOrError<T, HttpResponseMessage>> Get<T>(Uri uri, Dictionary<string, string> headers = null) where T : class;
        Task<MaybeResultOrError<T, HttpResponseMessage>> Post<T>(string armId, string apiVersion, object payload = null) where T : class;
        Task<MaybeResultOrError<T, HttpResponseMessage>> Put<T>(string armId, string apiVersion, object payload = null) where T : class;
    }
}
