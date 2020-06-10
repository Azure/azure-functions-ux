import { WebAppStack, JavaContainerSettings } from './../stack.model';

export const javaContainersStack: WebAppStack<JavaContainerSettings> = {
  displayText: 'Java Containers',
  value: 'Java Containers',
  sortOrder: 7,
  majorVersions: [
    {
      displayText: 'Java SE (embedded web server)',
      value: 'Java SE',
      minorVersions: [
        {
          displayText: 'Java SE 11 (Auto-update)',
          value: '11',
          platforms: {
            linuxSupport: {
              java11Runtime: 'JAVA|11-java11',
            },
          },
        },
        {
          displayText: 'Java SE 11.0.5',
          value: '11.0.5',
          platforms: {
            linuxSupport: {
              // Note (allisonm): This doesn't have suffix of -java11 since setting to 11.0.5 prevents auto-updates
              java11Runtime: 'JAVA|11.0.5',
            },
          },
        },
        {
          displayText: 'Java SE 8 (Auto-update)',
          value: '8',
          platforms: {
            windowsSupport: {
              javaContainer: 'JAVA',
              javaContainerVersion: '8',
            },
            linuxSupport: {
              java8Runtime: 'JAVA|8-jre8',
            },
          },
        },
        {
          displayText: 'Java SE 8u232',
          value: '8u232',
          platforms: {
            linuxSupport: {
              java8Runtime: 'JAVA|8u232',
            },
          },
        },
      ],
    },
    {
      displayText: 'Tomcat 9.0',
      value: 'Tomcat 9.0',
      minorVersions: [
        {
          displayText: 'Tomcat 9.0 (Auto-update)',
          value: '9.0',
          platforms: {
            windowsSupport: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '9.0',
            },
            linuxSupport: {
              java11Runtime: 'TOMCAT|9.0-java11',
              java8Runtime: 'TOMCAT|9.0-jre8',
            },
          },
        },
        {
          displayText: 'Tomcat 9.0.27',
          value: '9.0.27',
          platforms: {
            windowsSupport: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '9.0.27',
            },
          },
        },
        {
          displayText: 'Tomcat 9.0.21',
          value: '9.0.21',
          platforms: {
            windowsSupport: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '9.0.21',
            },
          },
        },
        {
          displayText: 'Tomcat 9.0.20',
          value: '9.0.20',
          platforms: {
            linuxSupport: {
              java11Runtime: 'TOMCAT|9.0.20-java11',
              java8Runtime: 'TOMCAT|9.0.20-java8', // Note (allisonm): Newer Tomcat versions use java8, not jre8
            },
          },
        },
        {
          displayText: 'Tomcat 9.0.14',
          value: '9.0.14',
          platforms: {
            windowsSupport: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '9.0.14',
            },
          },
        },
        {
          displayText: 'Tomcat 9.0.12',
          value: '9.0.12',
          platforms: {
            windowsSupport: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '9.0.12',
            },
          },
        },
        {
          displayText: 'Tomcat 9.0.8',
          value: '9.0.8',
          platforms: {
            windowsSupport: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '9.0.8',
            },
          },
        },
        {
          displayText: 'Tomcat 9.0.0',
          value: '9.0.0',
          platforms: {
            windowsSupport: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '9.0.0',
            },
          },
        },
      ],
    },
    {
      displayText: 'Tomcat 8.5',
      value: 'Tomcat 8.5',
      minorVersions: [
        {
          displayText: 'Tomcat 8.5 (Auto-update)',
          value: '8.5',
          platforms: {
            windowsSupport: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '8.5',
            },
            linuxSupport: {
              java11Runtime: 'TOMCAT|8.5-java11',
              java8Runtime: 'TOMCAT|8.5-jre8',
            },
          },
        },
        {
          displayText: 'Tomcat 8.5.6',
          value: '8.5.6',
          platforms: {
            windowsSupport: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '8.5.6',
            },
          },
        },
        {
          displayText: 'Tomcat 8.5.47',
          value: '8.5.47',
          platforms: {
            windowsSupport: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '8.5.47',
            },
          },
        },
        {
          displayText: 'Tomcat 8.5.42',
          value: '8.5.47',
          platforms: {
            windowsSupport: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '8.5.42',
            },
          },
        },
        {
          displayText: 'Tomcat 8.5.41',
          value: '8.5.47',
          platforms: {
            linuxSupport: {
              java11Runtime: 'TOMCAT|8.5.41-java11',
              java8Runtime: 'TOMCAT|8.5.41-java8', // Note (allisonm): Newer Tomcat versions use java8, not jre8
            },
          },
        },
        {
          displayText: 'Tomcat 8.5.37',
          value: '8.5.37',
          platforms: {
            windowsSupport: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '8.5.37',
            },
          },
        },
        {
          displayText: 'Tomcat 8.5.34',
          value: '8.5.34',
          platforms: {
            windowsSupport: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '8.5.34',
            },
          },
        },
        {
          displayText: 'Tomcat 8.5.31',
          value: '8.5.31',
          platforms: {
            windowsSupport: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '8.5.31',
            },
          },
        },
        {
          displayText: 'Tomcat 8.5.20',
          value: '8.5.20',
          platforms: {
            windowsSupport: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '8.5.20',
            },
          },
        },
      ],
    },
    {
      displayText: 'Tomcat 8.0',
      value: 'Tomcat 8.0',
      minorVersions: [
        {
          displayText: 'Tomcat 8.0 (Auto-Update)',
          value: '8.0',
          platforms: {
            windowsSupport: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '8.0',
            },
          },
        },
        {
          displayText: 'Tomcat 8.0.53',
          value: '8.0.53',
          platforms: {
            windowsSupport: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '8.0.53',
            },
          },
        },
        {
          displayText: 'Tomcat 8.0.46',
          value: '8.0.46',
          platforms: {
            windowsSupport: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '8.0.46',
            },
            linuxSupport: undefined,
          },
        },
        {
          displayText: 'Tomcat 8.0.23',
          value: '8.0.23',
          platforms: {
            windowsSupport: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '8.0.23',
            },
          },
        },
      ],
    },
    {
      displayText: 'Tomcat 7.0',
      value: 'Tomcat 7.0',
      minorVersions: [
        {
          displayText: 'Tomcat 7.0 (Auto-Update)',
          value: '7.0',
          platforms: {
            windowsSupport: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '7.0',
            },
          },
        },
        {
          displayText: 'Tomcat 7.0.94',
          value: '7.0.94',
          platforms: {
            windowsSupport: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '7.0.94',
            },
          },
        },
        {
          displayText: 'Tomcat 7.0.81',
          value: '7.0.81',
          platforms: {
            windowsSupport: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '7.0.81',
            },
          },
        },
        {
          displayText: 'Tomcat 7.0.62',
          value: '7.0.62',
          platforms: {
            windowsSupport: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '7.0.62',
            },
            linuxSupport: undefined,
          },
        },
        {
          displayText: 'Tomcat 7.0.50',
          value: '7.0.50',
          platforms: {
            windowsSupport: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '7.0.50',
            },
          },
        },
      ],
    },
    {
      displayText: 'Jetty 9.3',
      value: 'Jetty 9.3',
      minorVersions: [
        {
          displayText: 'Jetty 9.3 (Auto-Update)',
          value: '9.3',
          platforms: {
            windowsSupport: {
              javaContainer: 'JETTY',
              javaContainerVersion: '9.3',
            },
          },
        },
        {
          displayText: 'Jetty 9.3.25',
          value: '9.3.25',
          platforms: {
            windowsSupport: {
              javaContainer: 'JETTY',
              javaContainerVersion: '9.3.25',
            },
          },
        },
        {
          displayText: 'Jetty 9.3.13',
          value: '9.3.13',
          platforms: {
            windowsSupport: {
              javaContainer: 'JETTY',
              javaContainerVersion: '9.3.13',
            },
          },
        },
      ],
    },
    {
      displayText: 'Jetty 9.1',
      value: 'Jetty 9.1',
      minorVersions: [
        {
          displayText: 'Jetty 9.1 (Auto-Update)',
          value: '9.1',
          platforms: {
            windowsSupport: {
              javaContainer: 'JETTY',
              javaContainerVersion: '9.1',
            },
          },
        },
        {
          displayText: 'Jetty 9.1.0',
          value: '9.1.0',
          platforms: {
            windowsSupport: {
              javaContainer: 'JETTY',
              javaContainerVersion: '9.1.0',
            },
          },
        },
      ],
    },
    {
      displayText: 'WildFly 14',
      value: 'WildFly 14',
      minorVersions: [
        {
          displayText: 'WildFly 14',
          value: '14',
          platforms: {
            isDeprecated: true,
            linuxSupport: {
              java8Runtime: 'WILDFLY|14-jre8',
            },
          },
        },
      ],
    },
  ],
};
