export class ValidationRegex {
  public static readonly resourceGroupName = /^[^\s~!@#$%^&*+=<>,?/\\:;'"[\]{}|]*[^.\s~!@#$%^&*+=<>,?/\\:;'"[\]{}|]$/i;

  public static readonly appSettingName = /[^\w.]/;

  public static readonly queryName = /^[a-zA-Z0-9\-_*]+$/;

  public static readonly headerName = /^[a-zA-Z0-9\-_]+$/;

  public static readonly runtimeVersion = /^[0-9]+./;

  public static readonly StorageMountPath = {
    // Mount path for windows code should match /mounts followed by only one subdirectory. The subdirectory name can only contain letters, digits, (_), (-), (/), (\),
    // parentheses and square brackets. e.g /mounts/foo
    windowsCode: /^[/\\](mounts)[/\\][a-zA-Z0-9._\-[\]()]+[/\\]*$/,

    // Mount path for windows container can contain only letters, digits, (_), (-), (/), (\),
    // parentheses and square brackets. Drive letter (from c to z) is allowed as the prefix of the path. e.g c:/foo/bar/logs
    // /., \., [Cc-Zz]/. and [Cc-Zz]\. are invalid
    // /mounts, \mounts, c:/mounts, c:\mounts are invalid
    windowsContainer: [/^([c-zC-Z]:)?[/\\][a-zA-Z0-9._\-[\]()/\\]+$/, /^([c-zC-Z]:)?[/\\][/\\]?(.)$/, /^([c-zC-Z]:)?[/\\][/\\]?(mounts)/],

    // Mount path for windows container can only contain can only contain letters, digits, (_), (-), (/),
    // parentheses and square brackets. Drive letter is not allowed. e.g /foo/bar/logs
    linux: /^\/[a-zA-Z0-9.[\]()\-_/]+$/,

    homeDir: /^([c-zC-Z]:)?[/\\][/\\]?([Hh][Oo][Mm][Ee])$/,
  };

  public static readonly specialCharacters = new RegExp('^[^/\\\\#?]+$');

  public static readonly noSpacesAtEnd = new RegExp('[^\\s]+$');
}
