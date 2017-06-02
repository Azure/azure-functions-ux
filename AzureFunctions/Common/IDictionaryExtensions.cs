using System.Collections.Generic;

namespace AzureFunctions.Common
{
    public static class IDictionaryExtensions
    {
        public static bool ContainsKeyNotNullValue<TKey, TValue>(this IDictionary<TKey, TValue> dictionary, TKey key)
        {
            return dictionary.ContainsKey(key) && dictionary[key] != null;
        }
    }
}