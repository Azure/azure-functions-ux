import { WebAppStack } from '../../models/WebAppStackModel';

const python2EOL = new Date(2020, 1, 1).toString();

export const pythonStack: WebAppStack = {
  displayText: 'Python',
  value: 'python',
  preferredOs: 'windows',
  majorVersions: [
    {
      displayText: 'Python 3',
      value: '3',
      minorVersions: [
        {
          displayText: 'Python 3.6',
          value: '3.6',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '3.4.0',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '3.6',
              },
            },
          },
        },
      ],
    },
  ],
};
