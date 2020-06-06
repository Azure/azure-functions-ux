import { WebAppStack } from './../stack.model';

export const javaContainersStack: WebAppStack = {
  displayText: 'Java Containers',
  value: 'Java Containers',
  sortOrder: 7,
  preferredOs: undefined,
  majorVersions: [
    {
      displayText: 'Java SE (embedded web server)',
      value: 'Java SE',
      minorVersions: [],
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
