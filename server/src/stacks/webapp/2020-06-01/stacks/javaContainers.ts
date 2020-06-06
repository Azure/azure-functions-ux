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
      value: 'Tomcat 9.0',
      minorVersions: [],
    },
    {
      displayText: 'Tomcat 8.5',
      value: 'Tomcat 8.5',
      minorVersions: [],
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
