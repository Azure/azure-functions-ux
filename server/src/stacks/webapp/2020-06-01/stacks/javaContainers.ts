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
          displayText: 'Java SE 8 (Auto-update)',
          value: '8',
          containerSettings: {
            javaLinuxSupport: {
              java11Runtime: 'JAVA|11-java11',
              java8Runtime: 'JAVA|8-jre8',
            },
          },
        },
        {
          displayText: 'Java SE 8u232',
          value: '8u232',
          containerSettings: {
            javaLinuxSupport: {
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
            javaLinuxSupport: {
              java11Runtime: 'TOMCAT|9.0-java11',
              java8Runtime: 'TOMCAT|9.0-jre8',
            },
          },
        },
        {
          displayText: 'Tomcat 9.0.27',
          value: '9.0.27',
          containerSettings: {
            javaLinuxSupport: {},
          },
        },
        {
          displayText: 'Tomcat 9.0.21',
          value: '9.0.21',
          containerSettings: {
            javaLinuxSupport: {},
          },
        },
        {
          displayText: 'Tomcat 9.0.20',
          value: '9.0.20',
          containerSettings: {
            javaLinuxSupport: {
              java11Runtime: 'TOMCAT|9.0.20-java11',
              java8Runtime: 'TOMCAT|9.0.20-java8', // Note (allisonm): For some reason this is java8 not jre8
            },
          },
        },
        {
          displayText: 'Tomcat 9.0.21',
          value: '9.0.14',
          containerSettings: {
            javaLinuxSupport: {},
          },
        },
        {
          displayText: 'Tomcat 9.0.14',
          value: '9.0.12',
          containerSettings: {
            javaLinuxSupport: {},
          },
        },
        {
          displayText: 'Tomcat 9.0.14',
          value: '9.0.12',
          containerSettings: {
            javaLinuxSupport: {},
          },
        },
        {
          displayText: 'Tomcat 9.0.8',
          value: '9.0.8',
          containerSettings: {
            javaLinuxSupport: {},
          },
        },
        {
          displayText: 'Tomcat 9.0.0',
          value: '9.0.0',
          containerSettings: {
            javaLinuxSupport: {},
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
            javaLinuxSupport: {
              java11Runtime: 'TOMCAT|8.5-java11',
              java8Runtime: 'TOMCAT|8.5-jre8',
            },
          },
        },
        {
          displayText: 'Tomcat 8.5.6',
          value: '8.5.6',
          containerSettings: {
            javaLinuxSupport: {},
          },
        },
        {
          displayText: 'Tomcat 8.5.47',
          value: '8.5.47',
          containerSettings: {
            javaLinuxSupport: {},
          },
        },
        {
          displayText: 'Tomcat 8.5.42',
          value: '8.5.47',
          containerSettings: {
            javaLinuxSupport: {},
          },
        },
        {
          displayText: 'Tomcat 8.5.41',
          value: '8.5.47',
          containerSettings: {
            javaLinuxSupport: {
              java11Runtime: 'TOMCAT|8.5.41-java11',
              java8Runtime: 'TOMCAT|8.5.41-java8', // Note (allisonm): For some reason this is java8 not jre8
            },
          },
        },
        {
          displayText: 'Tomcat 8.5.37',
          value: '8.5.37',
          containerSettings: {
            javaLinuxSupport: {},
          },
        },
        {
          displayText: 'Tomcat 8.5.34',
          value: '8.5.34',
          containerSettings: {
            javaLinuxSupport: {},
          },
        },
        {
          displayText: 'Tomcat 8.5.31',
          value: '8.5.31',
          containerSettings: {
            javaLinuxSupport: {},
          },
        },
        {
          displayText: 'Tomcat 8.5.20',
          value: '8.5.20',
          containerSettings: {
            javaLinuxSupport: {},
          },
        },
      ],
    },
    {
      displayText: 'Tomcat 8.0',
      value: 'Tomcat 8.0',
      minorVersions: [],
    },
    {
      displayText: 'Tomcat 7.0',
      value: 'Tomcat 7.0',
      minorVersions: [],
    },
    {
      displayText: 'Jetty 9.1',
      value: 'Jetty 9.1',
      minorVersions: [],
    },
    {
      displayText: 'WildFly 14',
      value: 'WildFly 14',
      minorVersions: [],
    },
  ],
};
