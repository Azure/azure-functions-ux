import { isEqual } from 'lodash-es';

import { KeyValue } from '../models/portal-models';
import { ValidationRegex } from './constants/ValidationRegex';

export default class StringUtils {
  public static fileSeparator = '\\';
  public static buttonSeparator = '|';

  public static removeSpaces(value: string): string {
    return value.replace(/\s/g, '');
  }

  public static trimChar = (str: string, character: string) => {
    const first = [...str].findIndex(char => char !== character);
    const last = [...str].reverse().findIndex(char => char !== character);
    return str.substring(first, str.length - last);
  };

  public static formatString(value: string, formatParams: KeyValue<string>): string {
    let updatedValue = value;

    for (const param in formatParams) {
      if (param in formatParams) {
        updatedValue = updatedValue.replace(`{${param}}`, formatParams[param]);
      }
    }

    return updatedValue;
  }

  public static isEqualStringArray(items: string[] | null, otherItems: string[] | null): boolean {
    const itemsSorted = items && items.sort();
    const otherItemsSorted = otherItems && otherItems.sort();

    return isEqual(itemsSorted, otherItemsSorted);
  }

  public static equalsIgnoreCase(stringA?: string, stringB?: string): boolean {
    return !!stringA && !!stringB && stringA.toUpperCase() === stringB.toUpperCase();
  }

  public static isStringInArray(str: string, array: string[], ignoreCase?: boolean) {
    if (typeof str !== 'string' || !Array.isArray(array)) {
      return false;
    }

    return array.some((arrayStr: string) => (ignoreCase ? StringUtils.equalsIgnoreCase(str, arrayStr) : str === arrayStr));
  }

  public static endsWithIgnoreCase(source?: string, substring?: string): boolean {
    return !!source && !!substring && source.toUpperCase().endsWith(substring.toUpperCase());
  }

  public static stringifyJsonForEditor(value: any) {
    if (typeof value !== 'string') {
      // third parameter refers to the number of white spaces.
      // (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)
      return JSON.stringify(value, null, 2);
    } else {
      return value;
    }
  }

  public static getRuntimeVersionString(exactVersion: string) {
    if (ValidationRegex.runtimeVersion.test(exactVersion)) {
      const versionElements = exactVersion.split('.');
      return `~${versionElements[0]}`;
    }
    return exactVersion;
  }
}
