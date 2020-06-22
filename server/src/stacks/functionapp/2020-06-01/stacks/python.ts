import { FunctionAppStack } from './../stack.model';

export const PythonStack: FunctionAppStack = {
  displayText: 'Python',
  value: 'python',
  preferredOs: 'linux',
  majorVersions: [
    {
      displayText: 'Python 3',
      value: '3',
      minorVersions: [
        {
          displayText: 'Python 3.8',
          value: '3.8',
          stackSettings: {},
        },
        {
          displayText: 'Python 3.7',
          value: '3.7',
          stackSettings: {},
        },
        {
          displayText: 'Python 3.6',
          value: '3.6',
          stackSettings: {},
        },
      ],
    },
  ],
};
