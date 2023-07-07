export const enum JobType {
  /** @note Create a new function by adding it to an existing blueprint file. */
  AppendToBlueprint = 'AppendToBlueprint',
  /** @note Create a new function by adding it to an existing function app file. */
  AppendToFile = 'AppendToFile',
  /** @note Create a new function by including it in a new function app file. */
  CreateNewApp = 'CreateNewApp',
  /** @note Create a new function by including it in a new blueprint file. */
  CreateNewBlueprint = 'CreateNewBlueprint',
}
