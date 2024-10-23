import { WebAppStack } from '../../models/WebAppStackModel';

export const javaContainersStack: WebAppStack = {
  displayText: 'Java Containers',
  value: 'javacontainers',
  majorVersions: [
    {
      displayText: 'Java SE (Embedded Web Server)',
      value: 'javase',
      minorVersions: [
        {
          displayText: 'Java SE (Embedded Web Server)',
          value: 'SE',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'JAVA',
              // note (jafreebe): for Java SE the java container version doesn't matter
              javaContainerVersion: 'SE',
              isAutoUpdate: true,
            },
            linuxContainerSettings: {
              java17Runtime: 'JAVA|17-java17',
              java11Runtime: 'JAVA|11-java11',
              java8Runtime: 'JAVA|8-jre8',
              isAutoUpdate: true,
            },
          },
        },
      ],
    },
    {
      displayText: 'Apache Tomcat 11.0',
      value: 'tomcat11.0',
      minorVersions: [
        {
          displayText: 'Apache Tomcat 11.0',
          value: '11.0',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '11.0',
              isAutoUpdate: true,
            },
          },
        },
        {
          displayText: 'Apache Tomcat 11.0.0',
          value: '11.0.0',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '11.0.0',
            },
          },
        },
      ],
    },
    {
      displayText: 'Apache Tomcat 10.1',
      value: 'tomcat10.1',
      minorVersions: [
        {
          displayText: 'Apache Tomcat 10.1',
          value: '10.1',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '10.1',
              isAutoUpdate: true,
            },
            linuxContainerSettings: {
              java17Runtime: 'TOMCAT|10.1-java17',
              java11Runtime: 'TOMCAT|10.1-java11',
              isAutoUpdate: true,
            },
          },
        },
        {
          displayText: 'Apache Tomcat 10.1.31',
          value: '10.1.31',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '10.1.31',
            },
          },
        },
        {
          displayText: 'Apache Tomcat 10.1.25',
          value: '10.1.25',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '10.1.25',
            },
          },
        },
        {
          displayText: 'Apache Tomcat 10.1.16',
          value: '10.1.16',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '10.1.16',
            },
            linuxContainerSettings: {
              java11Runtime: 'TOMCAT|10.1.16-java11',
              java17Runtime: 'TOMCAT|10.1.16-java17',
            },
          },
        },
      ],
    },
    {
      displayText: 'Apache Tomcat 10.0',
      value: 'tomcat10.0',
      minorVersions: [
        {
          displayText: 'Apache Tomcat 10.0',
          value: '10.0',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '10.0',
              isAutoUpdate: true,
            },
            linuxContainerSettings: {
              java17Runtime: 'TOMCAT|10.0-java17',
              java11Runtime: 'TOMCAT|10.0-java11',
              java8Runtime: 'TOMCAT|10.0-jre8',
              isAutoUpdate: true,
            },
          },
        },
        {
          displayText: 'Apache Tomcat 10.0.27',
          value: '10.0.27',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '10.0.27',
            },
            linuxContainerSettings: {
              java8Runtime: 'TOMCAT|10.0.27-java8',
              java11Runtime: 'TOMCAT|10.0.27-java11',
              java17Runtime: 'TOMCAT|10.0.27-java17',
            },
          },
        },
        {
          displayText: 'Apache Tomcat 10.0.23',
          value: '10.0.23',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '10.0.23',
            },
            linuxContainerSettings: {
              java8Runtime: 'TOMCAT|10.0.23-java8',
              java11Runtime: 'TOMCAT|10.0.23-java11',
              java17Runtime: 'TOMCAT|10.0.23-java17',
            },
          },
        },
        {
          displayText: 'Apache Tomcat 10.0.21',
          value: '10.0.21',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '10.0.21',
            },
            linuxContainerSettings: {
              java8Runtime: 'TOMCAT|10.0.21-java8',
              java11Runtime: 'TOMCAT|10.0.21-java11',
              java17Runtime: 'TOMCAT|10.0.21-java17',
            },
          },
        },
        {
          displayText: 'Apache Tomcat 10.0.20',
          value: '10.0.20',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '10.0.20',
            },
            linuxContainerSettings: {
              java8Runtime: 'TOMCAT|10.0.20-java8',
              java11Runtime: 'TOMCAT|10.0.20-java11',
              java17Runtime: 'TOMCAT|10.0.20-java17',
            },
          },
        },
        {
          displayText: 'Apache Tomcat 10.0.12',
          value: '10.0.12',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '10.0.12',
            },
            linuxContainerSettings: {
              java8Runtime: 'TOMCAT|10.0.12-java8',
              java11Runtime: 'TOMCAT|10.0.12-java11',
              java17Runtime: 'TOMCAT|10.0.12-java17',
            },
          },
        },
      ],
    },
    {
      displayText: 'Apache Tomcat 9.0',
      value: 'tomcat9.0',
      minorVersions: [
        {
          displayText: 'Apache Tomcat 9.0',
          value: '9.0',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '9.0',
              isAutoUpdate: true,
            },
            linuxContainerSettings: {
              java17Runtime: 'TOMCAT|9.0-java17',
              java11Runtime: 'TOMCAT|9.0-java11',
              java8Runtime: 'TOMCAT|9.0-jre8',
              isAutoUpdate: true,
            },
          },
        },
        {
          displayText: 'Apache Tomcat 9.0.96',
          value: '9.0.96',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '9.0.96',
            },
          },
        },
        {
          displayText: 'Apache Tomcat 9.0.91',
          value: '9.0.91',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '9.0.91',
            },
          },
        },
        {
          displayText: 'Apache Tomcat 9.0.83',
          value: '9.0.83',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '9.0.83',
            },
            linuxContainerSettings: {
              java8Runtime: 'TOMCAT|9.0.83-java8',
              java11Runtime: 'TOMCAT|9.0.83-java11',
              java17Runtime: 'TOMCAT|9.0.83-java17',
            },
          },
        },
        {
          displayText: 'Apache Tomcat 9.0.65',
          value: '9.0.65',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '9.0.65',
            },
            linuxContainerSettings: {
              java8Runtime: 'TOMCAT|9.0.65-java8',
              java11Runtime: 'TOMCAT|9.0.65-java11',
              java17Runtime: 'TOMCAT|9.0.65-java17',
            },
          },
        },
        {
          displayText: 'Apache Tomcat 9.0.63',
          value: '9.0.63',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '9.0.63',
            },
            linuxContainerSettings: {
              java8Runtime: 'TOMCAT|9.0.63-java8',
              java11Runtime: 'TOMCAT|9.0.63-java11',
              java17Runtime: 'TOMCAT|9.0.63-java17',
            },
          },
        },
        {
          displayText: 'Apache Tomcat 9.0.62',
          value: '9.0.62',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '9.0.62',
            },
            linuxContainerSettings: {
              java8Runtime: 'TOMCAT|9.0.62-java8',
              java11Runtime: 'TOMCAT|9.0.62-java11',
              java17Runtime: 'TOMCAT|9.0.62-java17',
            },
          },
        },
        {
          displayText: 'Apache Tomcat 9.0.54',
          value: '9.0.54',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '9.0.54',
            },
            linuxContainerSettings: {
              java8Runtime: 'TOMCAT|9.0.54-java8',
              java11Runtime: 'TOMCAT|9.0.54-java11',
              java17Runtime: 'TOMCAT|9.0.54-java17',
            },
          },
        },
        {
          displayText: 'Apache Tomcat 9.0.52',
          value: '9.0.52',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '9.0.52',
            },
            linuxContainerSettings: {
              java8Runtime: 'TOMCAT|9.0.52-java8',
              java11Runtime: 'TOMCAT|9.0.52-java11',
            },
          },
        },
        {
          displayText: 'Apache Tomcat 9.0.46',
          value: '9.0.46',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '9.0.46',
            },
            linuxContainerSettings: {
              java8Runtime: 'TOMCAT|9.0.46-java8',
              java11Runtime: 'TOMCAT|9.0.46-java11',
            },
          },
        },
        {
          displayText: 'Apache Tomcat 9.0.41',
          value: '9.0.41',
          stackSettings: {
            linuxContainerSettings: {
              java8Runtime: 'TOMCAT|9.0.41-java8',
              java11Runtime: 'TOMCAT|9.0.41-java11',
            },
          },
        },
        {
          displayText: 'Apache Tomcat 9.0.38',
          value: '9.0.38',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '9.0.38',
            },
          },
        },
        {
          displayText: 'Apache Tomcat 9.0.37',
          value: '9.0.37',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '9.0.37',
            },
            linuxContainerSettings: {
              java11Runtime: 'TOMCAT|9.0.37-java11',
              java8Runtime: 'TOMCAT|9.0.37-java8', // Note (jafreebe): Newer Tomcat versions use java8, not jre8
            },
          },
        },
        {
          displayText: 'Apache Tomcat 9.0.33',
          value: '9.0.33',
          stackSettings: {
            linuxContainerSettings: {
              java11Runtime: 'TOMCAT|9.0.33-java11',
              java8Runtime: 'TOMCAT|9.0.33-java8', // Note (jafreebe): Newer Tomcat versions use java8, not jre8
            },
          },
        },
        {
          displayText: 'Apache Tomcat 9.0.31',
          value: '9.0.31',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '9.0.31',
            },
          },
        },
        {
          displayText: 'Apache Tomcat 9.0.27',
          value: '9.0.27',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '9.0.27',
            },
          },
        },
        {
          displayText: 'Apache Tomcat 9.0.21',
          value: '9.0.21',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '9.0.21',
            },
          },
        },
        {
          displayText: 'Apache Tomcat 9.0.20',
          value: '9.0.20',
          stackSettings: {
            linuxContainerSettings: {
              java11Runtime: 'TOMCAT|9.0.20-java11',
              java8Runtime: 'TOMCAT|9.0.20-java8', // Note (jafreebe): Newer Tomcat versions use java8, not jre8
            },
          },
        },
        {
          displayText: 'Apache Tomcat 9.0.14',
          value: '9.0.14',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '9.0.14',
            },
          },
        },
        {
          displayText: 'Apache Tomcat 9.0.12',
          value: '9.0.12',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '9.0.12',
            },
          },
        },
        {
          displayText: 'Apache Tomcat 9.0.8',
          value: '9.0.8',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '9.0.8',
            },
          },
        },
        {
          displayText: 'Apache Tomcat 9.0.0',
          value: '9.0.0',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '9.0.0',
            },
          },
        },
      ],
    },
    {
      displayText: 'Apache Tomcat 8.5',
      value: 'tomcat8.5',
      minorVersions: [
        {
          displayText: 'Apache Tomcat 8.5',
          value: '8.5',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '8.5',
              isAutoUpdate: true,
            },
            linuxContainerSettings: {
              java11Runtime: 'TOMCAT|8.5-java11',
              java8Runtime: 'TOMCAT|8.5-jre8',
              isAutoUpdate: true,
            },
          },
        },
        {
          displayText: 'Apache Tomcat 8.5.100',
          value: '8.5.100',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '8.5.100',
            },
          },
        },
        {
          displayText: 'Apache Tomcat 8.5.96',
          value: '8.5.96',
          stackSettings: {
            linuxContainerSettings: {
              java8Runtime: 'TOMCAT|8.5.96-java8',
              java11Runtime: 'TOMCAT|8.5.96-java11',
            },
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '8.5.96',
            },
          },
        },
        {
          displayText: 'Apache Tomcat 8.5.82',
          value: '8.5.82',
          stackSettings: {
            linuxContainerSettings: {
              java8Runtime: 'TOMCAT|8.5.82-java8',
              java11Runtime: 'TOMCAT|8.5.82-java11',
            },
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '8.5.82',
            },
          },
        },
        {
          displayText: 'Apache Tomcat 8.5.79',
          value: '8.5.79',
          stackSettings: {
            linuxContainerSettings: {
              java8Runtime: 'TOMCAT|8.5.79-java8',
              java11Runtime: 'TOMCAT|8.5.79-java11',
            },
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '8.5.79',
            },
          },
        },
        {
          displayText: 'Apache Tomcat 8.5.78',
          value: '8.5.78',
          stackSettings: {
            linuxContainerSettings: {
              java8Runtime: 'TOMCAT|8.5.78-java8',
              java11Runtime: 'TOMCAT|8.5.78-java11',
            },
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '8.5.78',
            },
          },
        },
        {
          displayText: 'Apache Tomcat 8.5.72',
          value: '8.5.72',
          stackSettings: {
            linuxContainerSettings: {
              java8Runtime: 'TOMCAT|8.5.72-java8',
              java11Runtime: 'TOMCAT|8.5.72-java11',
            },
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '8.5.72',
            },
          },
        },
        {
          displayText: 'Apache Tomcat 8.5.69',
          value: '8.5.69',
          stackSettings: {
            linuxContainerSettings: {
              java8Runtime: 'TOMCAT|8.5.69-java8',
              java11Runtime: 'TOMCAT|8.5.69-java11',
            },
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '8.5.69',
            },
          },
        },
        {
          displayText: 'Apache Tomcat 8.5.66',
          value: '8.5.66',
          stackSettings: {
            linuxContainerSettings: {
              java8Runtime: 'TOMCAT|8.5.66-java8',
              java11Runtime: 'TOMCAT|8.5.66-java11',
            },
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '8.5.66',
            },
          },
        },
        {
          displayText: 'Apache Tomcat 8.5.61',
          value: '8.5.61',
          stackSettings: {
            linuxContainerSettings: {
              java8Runtime: 'TOMCAT|8.5.61-java8',
              java11Runtime: 'TOMCAT|8.5.61-java11',
            },
          },
        },
        {
          displayText: 'Apache Tomcat 8.5.58',
          value: '8.5.58',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '8.5.58',
            },
          },
        },
        {
          displayText: 'Apache Tomcat 8.5.57',
          value: '8.5.57',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '8.5.57',
            },
            linuxContainerSettings: {
              java11Runtime: 'TOMCAT|8.5.57-java11',
              java8Runtime: 'TOMCAT|8.5.57-java8', // Note (jafreebe): Newer Tomcat versions use java8, not jre8
            },
          },
        },
        {
          displayText: 'Apache Tomcat 8.5.53',
          value: '8.5.53',
          stackSettings: {
            linuxContainerSettings: {
              java11Runtime: 'TOMCAT|8.5.53-java11',
              java8Runtime: 'TOMCAT|8.5.53-java8', // Note (jafreebe): Newer Tomcat versions use java8, not jre8
            },
          },
        },
        {
          displayText: 'Apache Tomcat 8.5.51',
          value: '8.5.51',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '8.5.51',
            },
          },
        },
        {
          displayText: 'Apache Tomcat 8.5.47',
          value: '8.5.47',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '8.5.47',
            },
          },
        },
        {
          displayText: 'Apache Tomcat 8.5.42',
          value: '8.5.42',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '8.5.42',
            },
          },
        },
        {
          displayText: 'Apache Tomcat 8.5.41',
          value: '8.5.41',
          stackSettings: {
            linuxContainerSettings: {
              java11Runtime: 'TOMCAT|8.5.41-java11',
              java8Runtime: 'TOMCAT|8.5.41-java8', // Note (jafreebe): Newer Tomcat versions use java8, not jre8
            },
          },
        },
        {
          displayText: 'Apache Tomcat 8.5.37',
          value: '8.5.37',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '8.5.37',
            },
          },
        },
        {
          displayText: 'Apache Tomcat 8.5.34',
          value: '8.5.34',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '8.5.34',
            },
          },
        },
        {
          displayText: 'Apache Tomcat 8.5.31',
          value: '8.5.31',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '8.5.31',
            },
          },
        },
        {
          displayText: 'Apache Tomcat 8.5.20',
          value: '8.5.20',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '8.5.20',
            },
          },
        },
        {
          displayText: 'Apache Tomcat 8.5.6',
          value: '8.5.6',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '8.5.6',
            },
          },
        },
      ],
    },
    {
      displayText: 'Apache Tomcat 8.0',
      value: 'tomcat8.0',
      minorVersions: [
        {
          displayText: 'Apache Tomcat 8.0',
          value: '8.0',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '8.0',
              isAutoUpdate: true,
              isDeprecated: true,
            },
          },
        },
        {
          displayText: 'Apache Tomcat 8.0.53',
          value: '8.0.53',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '8.0.53',
              isDeprecated: true,
            },
          },
        },
        {
          displayText: 'Apache Tomcat 8.0.46',
          value: '8.0.46',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '8.0.46',
              isDeprecated: true,
            },
          },
        },
        {
          displayText: 'Apache Tomcat 8.0.23',
          value: '8.0.23',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '8.0.23',
              isDeprecated: true,
            },
          },
        },
      ],
    },
    {
      displayText: 'Apache Tomcat 7.0',
      value: 'tomcat7.0',
      minorVersions: [
        {
          displayText: 'Apache Tomcat 7.0',
          value: '7.0',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '7.0',
              isAutoUpdate: true,
              isDeprecated: true,
            },
          },
        },
        {
          displayText: 'Apache Tomcat 7.0.94',
          value: '7.0.94',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '7.0.94',
              isDeprecated: true,
            },
          },
        },
        {
          displayText: 'Apache Tomcat 7.0.81',
          value: '7.0.81',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '7.0.81',
              isDeprecated: true,
            },
          },
        },
        {
          displayText: 'Apache Tomcat 7.0.62',
          value: '7.0.62',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '7.0.62',
              isDeprecated: true,
            },
          },
        },
        {
          displayText: 'Apache Tomcat 7.0.50',
          value: '7.0.50',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '7.0.50',
              isDeprecated: true,
            },
          },
        },
      ],
    },
    {
      displayText: 'Jetty 9.3',
      value: 'jetty9.3',
      minorVersions: [
        {
          displayText: 'Jetty 9.3',
          value: '9.3',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'JETTY',
              javaContainerVersion: '9.3',
              isAutoUpdate: true,
              isDeprecated: true,
            },
          },
        },
        {
          displayText: 'Jetty 9.3.25',
          value: '9.3.25',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'JETTY',
              javaContainerVersion: '9.3.25',
              isDeprecated: true,
            },
          },
        },
        {
          displayText: 'Jetty 9.3.13',
          value: '9.3.13',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'JETTY',
              javaContainerVersion: '9.3.13',
              isDeprecated: true,
            },
          },
        },
      ],
    },
    {
      displayText: 'Jetty 9.1',
      value: 'jetty9.1',
      minorVersions: [
        {
          displayText: 'Jetty 9.1',
          value: '9.1',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'JETTY',
              javaContainerVersion: '9.1',
              isAutoUpdate: true,
              isDeprecated: true,
            },
          },
        },
        {
          displayText: 'Jetty 9.1.0',
          value: '9.1.0',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'JETTY',
              javaContainerVersion: '9.1.0',
              isDeprecated: true,
            },
          },
        },
      ],
    },
    {
      displayText: 'WildFly 14',
      value: 'wildfly14',
      minorVersions: [
        {
          displayText: 'WildFly 14',
          value: '14',
          stackSettings: {
            linuxContainerSettings: {
              java8Runtime: 'WILDFLY|14-jre8',
              isDeprecated: true,
              isAutoUpdate: true,
            },
          },
        },
        {
          displayText: 'WildFly 14.0.1',
          value: '14.0.1',
          stackSettings: {
            linuxContainerSettings: {
              isDeprecated: true,
              java8Runtime: 'WILDFLY|14.0.1-java8',
            },
          },
        },
      ],
    },
  ],
};
