export class ValidationRegex {
  // eslint-disable-next-line no-useless-escape
  public static readonly resourceGroupName = /^[^\s~!@#$%^&*+=<>,\?\/\\\:;'"\[\]\{\}\|]*[^.\s~!@#$%^&*+=<>,\?\/\\\:;'"\[\]\{\}\|]$/i;

  // eslint-disable-next-line no-useless-escape
  public static readonly appSettingName = /[^\w\.]/;

  // eslint-disable-next-line no-useless-escape
  public static readonly queryName = /^[a-zA-Z0-9\-_*]+$/;

  // eslint-disable-next-line no-useless-escape
  public static readonly headerName = /^[a-zA-Z0-9\-_]+$/;

  // eslint-disable-next-line no-useless-escape
  public static readonly runtimeVersion = /^[0-9]+./;
}
