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
              // note (allisonm): for Java SE the java container version doesn't matter
              javaContainerVersion: 'SE',
              isAutoUpdate: true,
            },
            linuxContainerSettings: {
              java11Runtime: 'JAVA|11-java11',
              java8Runtime: 'JAVA|8-jre8',
              isAutoUpdate: true,
            },
          },
        },
        {
          displayText: 'Java SE 11.0.9',
          value: '11.0.9',
          stackSettings: {
            linuxContainerSettings: {
              // Note (jafreebe): This doesn't have suffix of -java11 since setting to 11.0.8 prevents auto-updates
              java11Runtime: 'JAVA|11.0.9',
            },
          },
        },
        {
          displayText: 'Java SE 11.0.7',
          value: '11.0.7',
          stackSettings: {
            linuxContainerSettings: {
              // Note (allisonm): This doesn't have suffix of -java11 since setting to 11.0.7 prevents auto-updates
              java11Runtime: 'JAVA|11.0.7',
            },
          },
        },
        {
          displayText: 'Java SE 11.0.6',
          value: '11.0.6',
          stackSettings: {
            linuxContainerSettings: {
              // Note (allisonm): This doesn't have suffix of -java11 since setting to 11.0.6 prevents auto-updates
              java11Runtime: 'JAVA|11.0.6',
            },
          },
        },
        {
          displayText: 'Java SE 11.0.5',
          value: '11.0.5',
          stackSettings: {
            linuxContainerSettings: {
              // Note (allisonm): This doesn't have suffix of -java11 since setting to 11.0.5 prevents auto-updates
              java11Runtime: 'JAVA|11.0.5',
            },
          },
        },
        {
          displayText: 'Java SE 8u252',
          // note (allisonm): Java SE 8u252 is pinned version that maps to the below value
          value: '1.8.252',
          stackSettings: {
            linuxContainerSettings: {
              java8Runtime: 'JAVA|8u252',
            },
          },
        },
        {
          displayText: 'Java SE 8u242',
          // note (allisonm): Java SE 8u242 is pinned version that maps to the below value
          value: '1.8.242',
          stackSettings: {
            linuxContainerSettings: {
              java8Runtime: 'JAVA|8u242',
            },
          },
        },
        {
          displayText: 'Java SE 8u232',
          // note (allisonm): Java SE 8u232 is pinned version that maps to the below value
          value: '1.8.232',
          stackSettings: {
            linuxContainerSettings: {
              java8Runtime: 'JAVA|8u232',
            },
          },
        },
      ],
    },
    {
      displayText: 'JBoss EAP',
      value: 'jbosseap',
      minorVersions: [
        {
          displayText: "JBoss EAP 7",
          value: "7",
          stackSettings: {
            linuxContainerSettings: {
              java8Runtime: "JBOSSEAP|7-java8",
              java11Runtime: "JBOSSEAP|7-java11",
              isAutoUpdate: true,
              isPreview: true
            }
          }
        },
        {
          displayText: 'JBoss EAP 7.3',
          value: '7.3',
          stackSettings: {
            linuxContainerSettings: {
              java8Runtime: 'JBOSSEAP|7.3-java8',
              java11Runtime: 'JBOSSEAP|7.3-java11',
              isPreview: true,
            },
          },
        },
        {
          displayText: 'JBoss EAP 7.2',
          value: '7.2',
          stackSettings: {
            linuxContainerSettings: {
              java8Runtime: 'JBOSSEAP|7.2-java8',
              isPreview: true,
            },
          },
        },
      ],
    },
    {
      displayText: 'Tomcat 9.0',
      value: 'tomcat9.0',
      minorVersions: [
        {
          displayText: 'Tomcat 9.0',
          value: '9.0',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '9.0',
              isAutoUpdate: true,
            },
            linuxContainerSettings: {
              java11Runtime: 'TOMCAT|9.0-java11',
              java8Runtime: 'TOMCAT|9.0-jre8',
              isAutoUpdate: true,
            },
          },
        },
        {
          displayText: "Tomcat 9.0.41",
          value: "9.0.41",
          stackSettings: {
            linuxContainerSettings: {
              java8Runtime: "TOMCAT|9.0.41-java8",
              java11Runtime: "TOMCAT|9.0.41-java11"
            }
          }
        },
        {
          displayText: 'Tomcat 9.0.38',
          value: '9.0.38',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '9.0.38',
            }
          },
        },
        {
          displayText: 'Tomcat 9.0.37',
          value: '9.0.37',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '9.0.37',
            },
            linuxContainerSettings: {
              java11Runtime: 'TOMCAT|9.0.37-java11',
              java8Runtime: 'TOMCAT|9.0.37-java8', // Note (allisonm): Newer Tomcat versions use java8, not jre8
            },
          },
        },
        {
          displayText: 'Tomcat 9.0.33',
          value: '9.0.33',
          stackSettings: {
            linuxContainerSettings: {
              java11Runtime: 'TOMCAT|9.0.33-java11',
              java8Runtime: 'TOMCAT|9.0.33-java8', // Note (allisonm): Newer Tomcat versions use java8, not jre8
            },
          },
        },
        {
          displayText: 'Tomcat 9.0.31',
          value: '9.0.31',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '9.0.31',
            },
          },
        },
        {
          displayText: 'Tomcat 9.0.27',
          value: '9.0.27',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '9.0.27',
            },
          },
        },
        {
          displayText: 'Tomcat 9.0.21',
          value: '9.0.21',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '9.0.21',
            },
          },
        },
        {
          displayText: 'Tomcat 9.0.20',
          value: '9.0.20',
          stackSettings: {
            linuxContainerSettings: {
              java11Runtime: 'TOMCAT|9.0.20-java11',
              java8Runtime: 'TOMCAT|9.0.20-java8', // Note (allisonm): Newer Tomcat versions use java8, not jre8
            },
          },
        },
        {
          displayText: 'Tomcat 9.0.14',
          value: '9.0.14',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '9.0.14',
            },
          },
        },
        {
          displayText: 'Tomcat 9.0.12',
          value: '9.0.12',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '9.0.12',
            },
          },
        },
        {
          displayText: 'Tomcat 9.0.8',
          value: '9.0.8',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '9.0.8',
            },
          },
        },
        {
          displayText: 'Tomcat 9.0.0',
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
      displayText: 'Tomcat 8.5',
      value: 'tomcat8.5',
      minorVersions: [
        {
          displayText: 'Tomcat 8.5',
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
          displayText: 'Tomcat 8.5.61',
          value: '8.5.61',
          stackSettings: {
            linuxContainerSettings: {
              java8Runtime: "TOMCAT|8.5.61-java8",
              java11Runtime: "TOMCAT|8.5.61-java11"
            }
          },
        },
        {
          displayText: 'Tomcat 8.5.58',
          value: '8.5.58',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '8.5.58',
            }
          },
        },
        {
          displayText: 'Tomcat 8.5.57',
          value: '8.5.57',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '8.5.57',
            },
            linuxContainerSettings: {
              java11Runtime: 'TOMCAT|8.5.57-java11',
              java8Runtime: 'TOMCAT|8.5.57-java8', // Note (allisonm): Newer Tomcat versions use java8, not jre8
            },
          },
        },
        {
          displayText: 'Tomcat 8.5.53',
          value: '8.5.53',
          stackSettings: {
            linuxContainerSettings: {
              java11Runtime: 'TOMCAT|8.5.53-java11',
              java8Runtime: 'TOMCAT|8.5.53-java8', // Note (allisonm): Newer Tomcat versions use java8, not jre8
            },
          },
        },
        {
          displayText: 'Tomcat 8.5.51',
          value: '8.5.51',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '8.5.51',
            },
          },
        },
        {
          displayText: 'Tomcat 8.5.47',
          value: '8.5.47',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '8.5.47',
            },
          },
        },
        {
          displayText: 'Tomcat 8.5.42',
          value: '8.5.42',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '8.5.42',
            },
          },
        },
        {
          displayText: 'Tomcat 8.5.41',
          value: '8.5.41',
          stackSettings: {
            linuxContainerSettings: {
              java11Runtime: 'TOMCAT|8.5.41-java11',
              java8Runtime: 'TOMCAT|8.5.41-java8', // Note (allisonm): Newer Tomcat versions use java8, not jre8
            },
          },
        },
        {
          displayText: 'Tomcat 8.5.37',
          value: '8.5.37',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '8.5.37',
            },
          },
        },
        {
          displayText: 'Tomcat 8.5.34',
          value: '8.5.34',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '8.5.34',
            },
          },
        },
        {
          displayText: 'Tomcat 8.5.31',
          value: '8.5.31',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '8.5.31',
            },
          },
        },
        {
          displayText: 'Tomcat 8.5.20',
          value: '8.5.20',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '8.5.20',
            },
          },
        },
        {
          displayText: 'Tomcat 8.5.6',
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
      displayText: 'Tomcat 8.0',
      value: 'tomcat8.0',
      minorVersions: [
        {
          displayText: 'Tomcat 8.0',
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
          displayText: 'Tomcat 8.0.53',
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
          displayText: 'Tomcat 8.0.46',
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
          displayText: 'Tomcat 8.0.23',
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
      displayText: 'Tomcat 7.0',
      value: 'tomcat7.0',
      minorVersions: [
        {
          displayText: 'Tomcat 7.0',
          value: '7.0',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '7.0',
              isAutoUpdate: true,
            },
          },
        },
        {
          displayText: 'Tomcat 7.0.94',
          value: '7.0.94',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '7.0.94',
            },
          },
        },
        {
          displayText: 'Tomcat 7.0.81',
          value: '7.0.81',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '7.0.81',
            },
          },
        },
        {
          displayText: 'Tomcat 7.0.62',
          value: '7.0.62',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '7.0.62',
            },
          },
        },
        {
          displayText: 'Tomcat 7.0.50',
          value: '7.0.50',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '7.0.50',
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
