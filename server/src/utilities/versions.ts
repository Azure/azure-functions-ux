export function versionCompare(version1: string, version2: string): -1 | 0 | 1 {
  let v1parts = version1.split('.');
  let v2parts = version2.split('.');

  while (v1parts.length < v2parts.length) v1parts.push('0');
  while (v2parts.length < v1parts.length) v2parts.push('0');

  for (var i = 0; i < v1parts.length; ++i) {
    if (+v1parts[i] === +v2parts[i]) {
      continue;
    } else if (+v1parts[i] > +v2parts[i]) {
      return 1;
    } else {
      return -1;
    }
  }
  return 0;
}

export function isNumericVersion(version: string) {
  // Checks version matches patter x.x with unlimited .x and x being any numeric value
  const regex = /\d+(?:\.\d+)*/;
  return regex.test(version);
}
