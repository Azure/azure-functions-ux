import { FunctionAppStack } from './../stack.model';

export const powershellStack: FunctionAppStack = {
  displayText: 'PowerShell Core',
  value: 'powershell',
  preferredOs: 'windows',
  majorVersions: [
    {
      displayText: 'PowerShell Core 7',
      value: '7',
      minorVersions: [
        {
          displayText: 'PowerShell Core 7.0',
          value: '7.0',
          stackSettings: {},
        },
      ],
    },
    {
      displayText: 'PowerShell Core 6',
      value: '6',
      minorVersions: [
        {
          displayText: 'PowerShell Core 6.2',
          value: '6.2',
          stackSettings: {},
        },
      ],
    },
  ],
};
