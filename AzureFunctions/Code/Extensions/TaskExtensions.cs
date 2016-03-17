using System.Collections.Generic;
using System.Threading.Tasks;

namespace AzureFunctions.Code.Extensions
{
    public static class TaskExtensions
    {
        public static Task WhenAll(this IEnumerable<Task> collection)
        {
            return Task.WhenAll(collection);
        }

        public static Task<T[]> WhenAll<T>(this IEnumerable<Task<T>> collection)
        {
            return Task.WhenAll(collection);
        }
    }
}