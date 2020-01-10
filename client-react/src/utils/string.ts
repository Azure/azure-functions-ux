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
}
