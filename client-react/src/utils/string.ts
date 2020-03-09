import { isEqual } from 'lodash-es';
import { KeyValue } from '../models/portal-models';

export default class StringUtils {
  public static fileSeparator = '\\';

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
    const itmesSorted = items && items.sort();
    const otherItemsSorted = otherItems && otherItems.sort();

    return isEqual(itmesSorted, otherItemsSorted);
  }
}
