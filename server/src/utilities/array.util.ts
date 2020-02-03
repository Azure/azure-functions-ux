export class ArrayUtil {
  public static remove<T>(arr: T[], callbackFn: (item: T) => boolean) {
    const numberOfElementsToRemove = arr.filter(callbackFn).length;
    for (let i = 0; i < numberOfElementsToRemove; i++) {
      const index = arr.findIndex(callbackFn);
      if (index > -1) {
        arr.splice(index, 1);
      }
    }
  }
}
