interface DateTimeObj {
  time: Date;
}
export function dateTimeComparator(a: DateTimeObj, b: DateTimeObj) {
  if (a.time < b.time) {
    return -1;
  }
  if (a.time > b.time) {
    return 1;
  }
  return 0;
}

export function dateTimeComparatorReverse(a: DateTimeObj, b: DateTimeObj) {
  if (a.time < b.time) {
    return 1;
  }
  if (a.time > b.time) {
    return -1;
  }
  return 0;
}
