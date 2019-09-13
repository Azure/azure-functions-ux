export default class RbacConstants {
  public static readScope = './read';
  public static writeScope = './write';
  public static deleteScope = './delete';
  public static actionScope = './action';
  public static activeDirectoryWriteScope = 'Microsoft.Authorization/*/Write';
  public static permissionsSuffix = '/providers/microsoft.authorization/permissions';
  public static authSuffix = '/providers/Microsoft.Authorization/locks';
  public static _wildCardEscapeSequence = '\\*';
}
