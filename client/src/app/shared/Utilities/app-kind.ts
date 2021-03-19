export interface KindCheckInput {
  kind: string;
}

export class AppKind {
  // Returns true if an ARM object has all of the kind values listed in kindsToCheck
  static hasKinds(obj: KindCheckInput, kindsToCheck: string[]): boolean {
    const objKind = obj.kind ? obj.kind.toLowerCase() : '';

    for (let i = 0; i < kindsToCheck.length; i++) {
      if (!objKind || objKind.indexOf(kindsToCheck[i].toLowerCase()) === -1) {
        return false;
      }
    }

    return true;
  }

  // Returns true if an ARM object has any of the kind values listed in kindsToCheck
  static hasAnyKind(obj: KindCheckInput, kindsToCheck: string[]): boolean {
    const objKind = obj.kind ? obj.kind.toLowerCase() : '';

    for (let i = 0; i < kindsToCheck.length; i++) {
      if (!!objKind && objKind.indexOf(kindsToCheck[i].toLowerCase()) > -1) {
        return true;
      }
    }

    return false;
  }
}
