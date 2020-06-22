import { FunctionAppStack } from '../stack.model';

export const nodeStack: FunctionAppStack = {
  displayText: 'Node.js',
  value: 'node',
  majorVersions: [
    {
      displayText: 'Node.js 12',
      value: '12',
      minorVersions: [],
    },
    {
      displayText: 'Node.js 10',
      value: '10',
      minorVersions: [],
    },
    {
      displayText: 'Node.js 8',
      value: '8',
      minorVersions: [],
    },
  ],
};
