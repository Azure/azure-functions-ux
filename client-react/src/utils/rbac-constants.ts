export default class RbacConstants {
  public static readScope = './read';
  public static writeScope = './write';
  public static deleteScope = './delete';
  public static actionScope = './action';
  public static activeDirectoryWriteScope = 'Microsoft.Authorization/*/Write';
  public static roleAssignmentWriteScope = 'Microsoft.Authorization/roleAssignments/Write';
  public static configListActionScope = 'Microsoft.Web/sites/config/list/action';
  public static configReadScope = 'Microsoft.Web/sites/config/read';
  public static configWriteScope = 'Microsoft.Web/sites/config/write';
}
