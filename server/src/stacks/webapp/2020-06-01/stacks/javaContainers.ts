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
      displayText: 'Tomcat 9',
      value: 'Tomcat',
      minorVersions: [],
    },
    {
      displayText: 'Tomcat 8',
      value: 'Tomcat',
      minorVersions: [],
    },
    {
      displayText: 'Tomcat 7',
      value: 'Tomcat',
      minorVersions: [],
    },
    {
      displayText: 'Jetty 9',
      value: 'Tomcat',
      minorVersions: [],
    },
  ],
};
