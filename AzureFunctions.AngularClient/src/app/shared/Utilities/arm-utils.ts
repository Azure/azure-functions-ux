import { FunctionContainer } from './../models/function-container';
import { ArmObj } from './../models/arm/arm-obj';

export namespace ArmUtil {
    export function isFunctionApp(obj: ArmObj<any> | FunctionContainer): boolean {
        return obj &&
            (obj.kind &&
                obj.kind.toLocaleLowerCase().indexOf('functionapp') !== -1 &&
                obj.kind.toLocaleLowerCase().indexOf('botapp') === -1) ||
            (obj.name && obj.name.toLocaleLowerCase().startsWith('00fun'));
    }

    export function isLinuxApp(obj: ArmObj<any> | FunctionContainer): boolean {
        return obj &&
            obj.kind &&
            obj.kind.toLocaleLowerCase().indexOf('linux') !== -1;
    }
}
