public static class StringExtensions
{
    public static string DoubleQuote(this string str)
    {
        return $"\"{str}\"";
    }
}