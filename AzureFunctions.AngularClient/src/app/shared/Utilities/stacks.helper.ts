import { AvailableStackNames, StackConfigKeys } from 'app/shared/models/constants';

export interface StackMetadata{
    ConfigKey: StackConfigKeys,
    AvailableStackName: AvailableStackNames,
    FriendlyName: string
}

export class StacksHelper {
    private static _StackProperties = [
        {
            ConfigKey: StackConfigKeys.NetStack,
            AvailableStackName: AvailableStackNames.NetStack,
            FriendlyName: ".NET Framework version"
        },
        {
            ConfigKey: StackConfigKeys.PhpStack,
            AvailableStackName: AvailableStackNames.PhpStack,
            FriendlyName: "PHP version"
        },
        {
            ConfigKey: StackConfigKeys.PythonStack,
            AvailableStackName: AvailableStackNames.PythonStack,
            FriendlyName: "Python version"
        },
        {
            ConfigKey: StackConfigKeys.JavaStack,
            AvailableStackName: AvailableStackNames.JavaStack,
            FriendlyName: "Java version"
        },
        {
            ConfigKey: StackConfigKeys.JavaContainer,
            AvailableStackName: AvailableStackNames.JavaContainer,
            FriendlyName: "Web container"
        }
    ]

    public static GetStackMetadata(configKey: string, availableStackName: string): StackMetadata {
        if(configKey)
            return this._StackProperties.find(r => r.ConfigKey === configKey);

        if(availableStackName)
            return this._StackProperties.find(r => r.AvailableStackName === availableStackName);
    }
}