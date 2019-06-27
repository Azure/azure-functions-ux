import { ArmObj } from '../models/arm-obj';

export class AppKind {
  // Returns true if an ARM object has all of the kind values listed in kindsToCheck
  public static hasKinds(obj: ArmObj<unknown>, kindsToCheck: string[]): boolean {
    const objKind = obj.kind ? obj.kind.toLowerCase() : '';

    for (const kindToCheck of kindsToCheck) {
      if (!objKind || objKind.indexOf(kindToCheck.toLowerCase()) === -1) {
        return false;
      }
    }

    return true;
  }

  // Returns true if an ARM object has any of the kind values listed in kindsToCheck
  public static hasAnyKind<T>(obj: ArmObj<T>, kindsToCheck: string[]): boolean {
    const objKind = obj.kind ? obj.kind.toLowerCase() : '';

    for (const kindToCheck of kindsToCheck) {
      if (!!objKind && objKind.indexOf(kindToCheck.toLowerCase()) > -1) {
        return true;
      }
    }

    return false;
  }
}
