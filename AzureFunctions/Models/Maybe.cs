namespace AzureFunctions.Models
{
    public class MaybeResultOrError<T, U>
    {
        public T Result { get; private set; }

        public U Error { get; private set; }

        public bool IsSuccessful { get; private set; }

        public MaybeResultOrError(bool isResult, T result = default(T), U error = default(U))
        {
            IsSuccessful = isResult;
            Result = result;
            Error = error;
        }
    }
}