import { FunctionAppStack } from './../stack.model';

const java11EOL = new Date(2026, 9);
const java8EOL = new Date(2025, 3);

export const JavaStack: FunctionAppStack = {
  displayText: 'Java',
  value: 'java',
  preferredOs: 'windows',
  majorVersions: [
    {
      displayText: 'Java 11',
      value: '11',
      minorVersions: [
        {
          displayText: 'Java 11',
          value: '11.0',
          stackSettings: {},
        },
      ],
    },
    {
      displayText: 'Java 8',
      value: '8',
      minorVersions: [
        {
          displayText: 'Java 8',
          value: '8.0',
          stackSettings: {},
        },
      ],
    },
  ],
};
