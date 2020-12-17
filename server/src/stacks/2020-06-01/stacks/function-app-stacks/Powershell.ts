import { FunctionAppStack } from '../../models/FunctionAppStackModel';

const powershell6point2EOL = new Date(2020, 9, 4).toString();

export const powershellStack: FunctionAppStack = {
  displayText: 'PowerShell Core',
  value: 'powershell',
  preferredOs: 'windows',
  majorVersions: [],
};
