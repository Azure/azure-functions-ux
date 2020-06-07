import { WebAppStack } from './../stack.model';

export const javaContainersStack: WebAppStack = {
  displayText: 'Java Containers',
  value: 'Java Containers',
  sortOrder: 7,
  majorVersions: [
    {
      displayText: 'Java SE (embedded web server)',
      value: 'JAVA',
      minorVersions: [
        {
          displayText: 'Java SE 11 (Auto-update)',
          value: '11',
          containerSettings: {
            windowsSupport: false,
            linuxSupport: {
              java11Runtime: 'JAVA|11-java11',
            },
          },
        },
        {
          displayText: 'Java SE 11.0.5',
          value: '11.0.5',
          containerSettings: {
            windowsSupport: false,
            linuxSupport: {
              java11Runtime: 'JAVA|11.0.5', // Note (allisonm): For some reason this doesn't have suffix of -java11
            },
          },
        },
        {
          displayText: 'Java SE 8 (Auto-update)',
          value: '8',
          containerSettings: {
            windowsSupport: true,
            linuxSupport: {
              java8Runtime: 'JAVA|8-jre8',
            },
          },
        },
        {
          displayText: 'Java SE 8u232',
          value: '8u232',
          containerSettings: {
            windowsSupport: false,
            linuxSupport: {
              java8Runtime: 'JAVA|8u232',
            },
          },
        },
      ],
    },
    {
      displayText: 'Tomcat 9.0',
      value: 'TOMCAT',
      minorVersions: [
        {
          displayText: 'Tomcat 9.0 (Auto-update)',
          value: '9.0',
          containerSettings: {
            windowsSupport: true,
            linuxSupport: {
              java11Runtime: 'TOMCAT|9.0-java11',
              java8Runtime: 'TOMCAT|9.0-jre8',
            },
          },
        },
        {
          displayText: 'Tomcat 9.0.27',
          value: '9.0.27',
          containerSettings: {
            windowsSupport: true,
            linuxSupport: false,
          },
        },
        {
          displayText: 'Tomcat 9.0.21',
          value: '9.0.21',
          containerSettings: {
            windowsSupport: true,
            linuxSupport: false,
          },
        },
        {
          displayText: 'Tomcat 9.0.20',
          value: '9.0.20',
          containerSettings: {
            windowsSupport: false,
            linuxSupport: {
              java11Runtime: 'TOMCAT|9.0.20-java11',
              java8Runtime: 'TOMCAT|9.0.20-java8', // Note (allisonm): For some reason this is java8 not jre8
            },
          },
        },
        {
          displayText: 'Tomcat 9.0.21',
          value: '9.0.14',
          containerSettings: {
            windowsSupport: true,
            linuxSupport: false,
          },
        },
        {
          displayText: 'Tomcat 9.0.14',
          value: '9.0.12',
          containerSettings: {
            windowsSupport: true,
            linuxSupport: false,
          },
        },
        {
          displayText: 'Tomcat 9.0.14',
          value: '9.0.12',
          containerSettings: {
            windowsSupport: true,
            linuxSupport: false,
          },
        },
        {
          displayText: 'Tomcat 9.0.8',
          value: '9.0.8',
          containerSettings: {
            windowsSupport: true,
            linuxSupport: false,
          },
        },
        {
          displayText: 'Tomcat 9.0.0',
          value: '9.0.0',
          containerSettings: {
            windowsSupport: true,
            linuxSupport: false,
          },
        },
      ],
    },
    {
      displayText: 'Tomcat 8.5',
      value: 'TOMCAT',
      minorVersions: [
        {
          displayText: 'Tomcat 8.5 (Auto-update)',
          value: '8.5',
          containerSettings: {
            windowsSupport: true,
            linuxSupport: {
              java11Runtime: 'TOMCAT|8.5-java11',
              java8Runtime: 'TOMCAT|8.5-jre8',
            },
          },
        },
        {
          displayText: 'Tomcat 8.5.6',
          value: '8.5.6',
          containerSettings: {
            windowsSupport: true,
            linuxSupport: false,
          },
        },
        {
          displayText: 'Tomcat 8.5.47',
          value: '8.5.47',
          containerSettings: {
            windowsSupport: true,
            linuxSupport: false,
          },
        },
        {
          displayText: 'Tomcat 8.5.42',
          value: '8.5.47',
          containerSettings: {
            windowsSupport: true,
            linuxSupport: false,
          },
        },
        {
          displayText: 'Tomcat 8.5.41',
          value: '8.5.47',
          containerSettings: {
            windowsSupport: false,
            linuxSupport: {
              java11Runtime: 'TOMCAT|8.5.41-java11',
              java8Runtime: 'TOMCAT|8.5.41-java8', // Note (allisonm): For some reason this is java8 not jre8
            },
          },
        },
        {
          displayText: 'Tomcat 8.5.37',
          value: '8.5.37',
          containerSettings: {
            windowsSupport: true,
            linuxSupport: false,
          },
        },
        {
          displayText: 'Tomcat 8.5.34',
          value: '8.5.34',
          containerSettings: {
            windowsSupport: true,
            linuxSupport: false,
          },
        },
        {
          displayText: 'Tomcat 8.5.31',
          value: '8.5.31',
          containerSettings: {
            windowsSupport: true,
            linuxSupport: false,
          },
        },
        {
          displayText: 'Tomcat 8.5.20',
          value: '8.5.20',
          containerSettings: {
            windowsSupport: true,
            linuxSupport: false,
          },
        },
      ],
    },
    {
      displayText: 'Tomcat 8.0',
      value: 'TOMCAT',
      minorVersions: [
        {
          displayText: 'Tomcat 8.0 (Auto-Update)',
          value: '8.0',
          containerSettings: {
            windowsSupport: true,
            linuxSupport: false,
          },
        },
        {
          displayText: 'Tomcat 8.0.53',
          value: '8.0.53',
          containerSettings: {
            windowsSupport: true,
            linuxSupport: false,
          },
        },
        {
          displayText: 'Tomcat 8.0.46',
          value: '8.0.46',
          containerSettings: {
            windowsSupport: true,
            linuxSupport: false,
          },
        },
        {
          displayText: 'Tomcat 8.0.23',
          value: '8.0.23',
          containerSettings: {
            windowsSupport: true,
            linuxSupport: false,
          },
        },
      ],
    },
    {
      displayText: 'Tomcat 7.0',
      value: 'TOMCAT',
      minorVersions: [
        {
          displayText: 'Tomcat 7.0 (Auto-Update)',
          value: '7.0',
          containerSettings: {
            windowsSupport: true,
            linuxSupport: false,
          },
        },
        {
          displayText: 'Tomcat 7.0.94',
          value: '7.0.94',
          containerSettings: {
            windowsSupport: true,
            linuxSupport: false,
          },
        },
        {
          displayText: 'Tomcat 7.0.81',
          value: '7.0.81',
          containerSettings: {
            windowsSupport: true,
            linuxSupport: false,
          },
        },
        {
          displayText: 'Tomcat 7.0.62',
          value: '7.0.62',
          containerSettings: {
            windowsSupport: true,
            linuxSupport: false,
          },
        },
        {
          displayText: 'Tomcat 7.0.50',
          value: '7.0.50',
          containerSettings: {
            windowsSupport: true,
            linuxSupport: false,
          },
        },
      ],
    },
    {
      displayText: 'Jetty 9.3',
      value: 'JETTY',
      minorVersions: [
        {
          displayText: 'Jetty 9.3 (Auto-Update)',
          value: '9.3',
          containerSettings: {
            windowsSupport: true,
            linuxSupport: false,
          },
        },
        {
          displayText: 'Jetty 9.3.25',
          value: '9.3.25',
          containerSettings: {
            windowsSupport: true,
            linuxSupport: false,
          },
        },
        {
          displayText: 'Jetty 9.3.13',
          value: '9.3.13',
          containerSettings: {
            windowsSupport: true,
            linuxSupport: false,
          },
        },
      ],
    },
    {
      displayText: 'Jetty 9.1',
      value: 'JETTY',
      minorVersions: [
        {
          displayText: 'Jetty 9.1 (Auto-Update)',
          value: '9.1',
          containerSettings: {
            windowsSupport: true,
            linuxSupport: false,
          },
        },
        {
          displayText: 'Jetty 9.1.0',
          value: '9.1.0',
          containerSettings: {
            windowsSupport: true,
            linuxSupport: false,
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
          containerSettings: {
            isPreview: true,
            isHidden: true,
            windowsSupport: false,
            linuxSupport: {
              java8Runtime: 'WILDFLY|14-jre8',
            },
          },
        },
      ],
    },
  ],
};
