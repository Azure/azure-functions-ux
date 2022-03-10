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
        {
          displayText: 'Java SE 17.0.1',
          value: '17.0.1',
          stackSettings: {
            linuxContainerSettings: {
              // Note (jafreebe): This doesn't have suffix of -java11 since setting to 11.0.8 prevents auto-updates
              java17Runtime: 'JAVA|17.0.1',
            },
          },
        },
        {
          displayText: 'Java SE 11.0.13',
          value: '11.0.13',
          stackSettings: {
            linuxContainerSettings: {
              // Note (jafreebe): This doesn't have suffix of -java11 since setting to 11.0.8 prevents auto-updates
              java11Runtime: 'JAVA|11.0.13',
            },
          },
        },
        {
          displayText: 'Java SE 11.0.12',
          value: '11.0.12',
          stackSettings: {
            linuxContainerSettings: {
              // Note (jafreebe): This doesn't have suffix of -java11 since setting to 11.0.8 prevents auto-updates
              java11Runtime: 'JAVA|11.0.12',
            },
          },
        },
        {
          displayText: 'Java SE 11.0.11',
          value: '11.0.11',
          stackSettings: {
            linuxContainerSettings: {
              // Note (jafreebe): This doesn't have suffix of -java11 since setting to 11.0.8 prevents auto-updates
              java11Runtime: 'JAVA|11.0.11',
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
              // Note (jafreebe): This doesn't have suffix of -java11 since setting to 11.0.7 prevents auto-updates
              java11Runtime: 'JAVA|11.0.7',
            },
          },
        },
        {
          displayText: 'Java SE 11.0.6',
          value: '11.0.6',
          stackSettings: {
            linuxContainerSettings: {
              // Note (jafreebe): This doesn't have suffix of -java11 since setting to 11.0.6 prevents auto-updates
              java11Runtime: 'JAVA|11.0.6',
            },
          },
        },
        {
          displayText: 'Java SE 11.0.5',
          value: '11.0.5',
          stackSettings: {
            linuxContainerSettings: {
              // Note (jafreebe): This doesn't have suffix of -java11 since setting to 11.0.5 prevents auto-updates
              java11Runtime: 'JAVA|11.0.5',
            },
          },
        },
        {
          displayText: 'Java SE 8u312',
          // note (jafreebe): Java SE 8u312 is pinned version that maps to the below value
          value: '1.8.312',
          stackSettings: {
            linuxContainerSettings: {
              java8Runtime: 'JAVA|8u312',
            },
          },
        },
        {
          displayText: 'Java SE 8u302',
          // note (jafreebe): Java SE 8u302 is pinned version that maps to the below value
          value: '1.8.302',
          stackSettings: {
            linuxContainerSettings: {
              java8Runtime: 'JAVA|8u302',
            },
          },
        },
        {
          displayText: 'Java SE 8u292',
          // note (jafreebe): Java SE 8u292 is pinned version that maps to the below value
          value: '1.8.292',
          stackSettings: {
            linuxContainerSettings: {
              java8Runtime: 'JAVA|8u292',
            },
          },
        },
        {
          displayText: 'Java SE 8u275',
          // note (jafreebe): Java SE 8u275 is pinned version that maps to the below value
          value: '1.8.275',
          stackSettings: {
            linuxContainerSettings: {
              java8Runtime: 'JAVA|8u275',
            },
          },
        },
        {
          displayText: 'Java SE 8u252',
          // note (jafreebe): Java SE 8u252 is pinned version that maps to the below value
          value: '1.8.252',
          stackSettings: {
            linuxContainerSettings: {
              java8Runtime: 'JAVA|8u252',
            },
          },
        },
        {
          displayText: 'Java SE 8u242',
          // note (jafreebe): Java SE 8u242 is pinned version that maps to the below value
          value: '1.8.242',
          stackSettings: {
            linuxContainerSettings: {
              java8Runtime: 'JAVA|8u242',
            },
          },
        },
        {
          displayText: 'Java SE 8u232',
          // note (jafreebe): Java SE 8u232 is pinned version that maps to the below value
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
      displayText: 'Red Hat JBoss EAP 7',
      value: 'jbosseap',
      minorVersions: [
        {
          displayText: 'Red Hat JBoss EAP 7',
          value: '7',
          stackSettings: {
            linuxContainerSettings: {
              java8Runtime: 'JBOSSEAP|7-java8',
              java11Runtime: 'JBOSSEAP|7-java11',
              isAutoUpdate: true,
            },
          },
        },
        {
          displayText: 'Red Hat JBoss EAP 7.4.1',
          value: '7.4.1',
          stackSettings: {
            linuxContainerSettings: {
              java8Runtime: 'JBOSSEAP|7.4.1-java8',
              java11Runtime: 'JBOSSEAP|7.4.1-java11'
            }
          }
        },
        {
          displayText: 'Red Hat JBoss EAP 7.4.0',
          value: '7.4.0',
          stackSettings: {
            linuxContainerSettings: {
              java8Runtime: 'JBOSSEAP|7.4.0-java8',
              java11Runtime: 'JBOSSEAP|7.4.0-java11'
            }
          }
        },
        {
          displayText: 'Red Hat JBoss EAP 7.3.9',
          value: '7.3.9',
          stackSettings: {
            linuxContainerSettings: {
              java8Runtime: 'JBOSSEAP|7.3.9-java8',
              java11Runtime: 'JBOSSEAP|7.3.9-java11'
            }
          }
        },
        {
          displayText: 'Red Hat JBoss EAP 7.3',
          value: '7.3',
          stackSettings: {
            linuxContainerSettings: {
              java8Runtime: 'JBOSSEAP|7.3-java8',
              java11Runtime: 'JBOSSEAP|7.3-java11',
              isAutoUpdate: true,
              isHidden: true,  // note (jafreebe) March 2022: Only have 1 auto-update lane at the major version (7.x.x)
            }
          }
        },
        {
          displayText: 'Red Hat JBoss EAP 7.4',
          value: '7.4',
          stackSettings: {
            linuxContainerSettings: {
              java8Runtime: 'JBOSSEAP|7.4-java8',
              java11Runtime: 'JBOSSEAP|7.4-java11',
              isAutoUpdate: true,
              isHidden: true,  // note (jafreebe) March 2022: Only have 1 auto-update lane at the major version (7.x.x)
            }
          }
        },
        {
          displayText: 'JBoss EAP 7.2',
          value: '7.2.0',
          stackSettings: {
            linuxContainerSettings: {
              java8Runtime: 'JBOSSEAP|7.2-java8',
              isDeprecated: true
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
          displayText: 'Apache Tomcat 10.0.17',
          value: '10.0.17',
          stackSettings: {
            windowsContainerSettings: {
              javaContainer: 'TOMCAT',
              javaContainerVersion: '10.0.17',
            },
            linuxContainerSettings: {
              java8Runtime: 'TOMCAT|10.0.12-java8',
              java11Runtime: 'TOMCAT|10.0.12-java11',
              java17Runtime: 'TOMCAT|10.0.12-java17'
            },
          },
        },
      ]
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
              java17Runtime: 'TOMCAT|9.0.54-java17'
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
