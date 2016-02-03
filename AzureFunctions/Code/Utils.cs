using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace AzureFunctions.Code
{
    public static class Utils
    {
        public static async Task SafeGuard(Func<Task> action)
        {
            try
            {
                await action();
            }
            catch (Exception e)
            {
                System.Diagnostics.Trace.TraceError($"SafeGuard Exception: {e.ToString()}");
            }
        }
        public static async Task<T> SafeGuard<T>(Func<Task<T>> action)
        {
            try
            {
                return await action();
            }
            catch (Exception e)
            {
                System.Diagnostics.Trace.TraceError($"SafeGuard<T> Exception: {e.ToString()}");
                return default(T);
            }
        }
    }
}