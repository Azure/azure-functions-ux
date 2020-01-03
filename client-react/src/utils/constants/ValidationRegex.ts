export class ValidationRegex {
  // eslint-disable-next-line no-useless-escape
  public static readonly resourceGroupName = /^[^\s~!@#$%^&*+=<>,\?\/\\\:;'"\[\]\{\}\|]*[^.\s~!@#$%^&*+=<>,\?\/\\\:;'"\[\]\{\}\|]$/i;

  // eslint-disable-next-line no-useless-escape
  public static readonly appSettingName = /[^\w\.]/;
}
