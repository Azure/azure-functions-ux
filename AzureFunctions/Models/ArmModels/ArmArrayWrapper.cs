namespace AzureFunctions.Models.ArmModels
{
    public class ArmArrayWrapper<T>
    {
        public ArmWrapper<T>[] value { get; set; }
    }
}