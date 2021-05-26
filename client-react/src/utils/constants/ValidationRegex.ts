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

  public static readonly storageMountPath = {
    // Mount path for windows code should match /mounts followed by only one subdirectory. The subdirectory name can only contain letters, digits, (_), (-), (/), (\),
    // parentheses and square brackets. e.g /mounts/foo
    // eslint-disable-next-line no-useless-escape
    windowsCode: /^[\/\\](mounts)[\/\\][a-zA-Z0-9._\-\[\]\(\)]+[\/\\]*$/,

    // Mount path for windows container can only contain can only contain letters, digits, (_), (-), (/), (\),
    // parentheses and square brackets. Drive letter is also allowed as the prefix of the path. e.g c:/foo/bar/logs
    // eslint-disable-next-line no-useless-escape
    windowsContainer: /^([a-zA-Z]:)?[\/\\][a-zA-Z0-9._\-\[\]\(\)\/\\]+$/,

    // Mount path for windows container can only contain can only contain letters, digits, (_), (-), (/), (\),
    // parentheses and square brackets. Drive letter is not allowed. e.g /foo/bar/logs
    // eslint-disable-next-line no-useless-escape
    linux: /^\/[a-zA-Z0-9.\[\]\(\)\-_\/]*$/,
  };
}
