import { ArmObj } from '../models/arm/arm-obj';

export class AppKind {

    // Returns true if an ARM object has all of the kind values listed in kindsToCheck
    static hasKinds<T>(obj: ArmObj<T>, kindsToCheck: string[]) {
        const objKind = obj.kind ? obj.kind.toLowerCase() : '';

        for (let i = 0; i < kindsToCheck.length; i++) {
            if (!objKind || objKind.indexOf(kindsToCheck[i].toLowerCase()) === -1) {
                return false;
            }
        };

        return true;
    }
}
