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

  public static formatString(value: string, formatParams: { [key: string]: string }): string {
    let updatedValue = value;

    for (const param in formatParams) {
      if (param in formatParams) {
        updatedValue = updatedValue.replace(`{${param}}`, formatParams[param]);
      }
    }

    return updatedValue;
  }
}
