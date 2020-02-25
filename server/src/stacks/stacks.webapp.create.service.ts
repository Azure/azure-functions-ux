import { Injectable } from '@nestjs/common';
import { WebAppCreateStack, WebAppCreateStackVersionPlatform, WebAppCreateStackVersion } from './stacks';
import { ArrayUtil } from '../utilities/array.util';

@Injectable()
export class StacksWebAppCreateService {
  private _aspNetStacks: WebAppCreateStack = {
    displayText: 'ASP.NET',
    value: 'ASP.NET',
    sortOrder: 0,
    versions: [
      {
        displayText: 'ASP.NET V4.7',
        value: 'V4.7',
        sortOrder: 0,
        supportedPlatforms: [
          {
            os: 'windows',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: true,
            remoteDebuggingEnabled: false,
            runtimeVersion: 'v4.0',
            sortOrder: 0,
            githubActionSettings: {
              supported: false,
            },
          },
        ],
      },
      {
        displayText: 'ASP.NET V3.5',
        value: 'V3.5',
        sortOrder: 1,
        supportedPlatforms: [
          {
            os: 'windows',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: true,
            remoteDebuggingEnabled: false,
            runtimeVersion: 'v2.0',
            sortOrder: 0,
            githubActionSettings: {
              supported: false,
            },
          },
        ],
      },
    ],
  };

  private _nodeStacks: WebAppCreateStack = {
    displayText: 'Node',
    value: 'Node',
    sortOrder: 1,
    versions: [
      {
        displayText: 'Node 12 LTS',
        value: '12-LTS',
        sortOrder: 0,
        supportedPlatforms: [
          {
            os: 'linux',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: true,
            remoteDebuggingEnabled: false,
            runtimeVersion: 'NODE|12-lts',
            sortOrder: 0,
            githubActionSettings: {
              supported: true,
              recommendedVersion: '12.x',
            },
          },
          {
            os: 'windows',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: true,
            remoteDebuggingEnabled: false,
            runtimeVersion: '12.13.0',
            sortOrder: 1,
            githubActionSettings: {
              supported: true,
            },
          },
        ],
      },
      {
        displayText: 'Node 10 LTS',
        value: '10-LTS',
        sortOrder: 1,
        supportedPlatforms: [
          {
            os: 'linux',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: true,
            remoteDebuggingEnabled: false,
            runtimeVersion: 'NODE|10-lts',
            sortOrder: 0,
            githubActionSettings: {
              supported: true,
              recommendedVersion: '10.x',
            },
          },
        ],
      },
      {
        displayText: 'Node 10.14',
        value: '10.14',
        sortOrder: 2,
        supportedPlatforms: [
          {
            os: 'linux',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: true,
            remoteDebuggingEnabled: false,
            runtimeVersion: 'NODE|10.14',
            sortOrder: 0,
            githubActionSettings: {
              supported: true,
            },
          },
          {
            os: 'windows',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: true,
            remoteDebuggingEnabled: false,
            runtimeVersion: '10.14.1',
            sortOrder: 1,
            githubActionSettings: {
              supported: true,
            },
          },
        ],
      },
      {
        displayText: 'Node 10.10',
        value: '10.10',
        sortOrder: 3,
        supportedPlatforms: [
          {
            os: 'linux',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: true,
            remoteDebuggingEnabled: false,
            runtimeVersion: 'NODE|10.10',
            sortOrder: 0,
            githubActionSettings: {
              supported: true,
            },
          },
        ],
      },
      {
        displayText: 'Node 10.6',
        value: '10.6',
        sortOrder: 4,
        supportedPlatforms: [
          {
            os: 'linux',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: true,
            remoteDebuggingEnabled: false,
            runtimeVersion: 'NODE|10.6',
            sortOrder: 0,
            githubActionSettings: {
              supported: true,
            },
          },
          {
            os: 'windows',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: true,
            remoteDebuggingEnabled: false,
            runtimeVersion: '10.6.0',
            sortOrder: 1,
            githubActionSettings: {
              supported: true,
            },
          },
        ],
      },
      {
        displayText: 'Node 10.1',
        value: '10.1',
        sortOrder: 5,
        supportedPlatforms: [
          {
            os: 'linux',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: true,
            remoteDebuggingEnabled: false,
            runtimeVersion: 'NODE|10.1',
            sortOrder: 0,
            githubActionSettings: {
              supported: true,
            },
          },
        ],
      },
      {
        displayText: 'Node 10.0',
        value: '10.0',
        sortOrder: 6,
        supportedPlatforms: [
          {
            os: 'windows',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: true,
            remoteDebuggingEnabled: false,
            runtimeVersion: '10.0.0',
            sortOrder: 0,
            githubActionSettings: {
              supported: true,
            },
          },
        ],
      },
    ],
  };

  private _pythonStacks: WebAppCreateStack = {
    displayText: 'Python',
    value: 'Python',
    sortOrder: 2,
    versions: [
      {
        displayText: 'Python 3.8',
        value: '3.7',
        sortOrder: 0,
        supportedPlatforms: [
          {
            os: 'linux',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: false,
            remoteDebuggingEnabled: false,
            runtimeVersion: 'PYTHON|3.8',
            sortOrder: 0,
            githubActionSettings: {
              supported: true,
            },
          },
        ],
      },
      {
        displayText: 'Python 3.7',
        value: '3.7',
        sortOrder: 1,
        supportedPlatforms: [
          {
            os: 'linux',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: false,
            remoteDebuggingEnabled: false,
            runtimeVersion: 'PYTHON|3.7',
            sortOrder: 0,
            githubActionSettings: {
              supported: true,
            },
          },
        ],
      },
      {
        displayText: 'Python 3.6',
        value: '3.6',
        sortOrder: 2,
        supportedPlatforms: [
          {
            os: 'linux',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: false,
            remoteDebuggingEnabled: false,
            runtimeVersion: 'PYTHON|3.6',
            sortOrder: 0,
            githubActionSettings: {
              supported: true,
            },
          },
          {
            os: 'windows',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: true,
            remoteDebuggingEnabled: false,
            runtimeVersion: '3.4',
            sortOrder: 1,
            githubActionSettings: {
              supported: true,
              recommendedVersion: '3.6',
            },
          },
        ],
      },
    ],
  };

  private _phpStacks: WebAppCreateStack = {
    displayText: 'PHP',
    value: 'PHP',
    sortOrder: 3,
    versions: [
      {
        displayText: 'PHP 7.3',
        value: '7.3',
        sortOrder: 0,
        supportedPlatforms: [
          {
            os: 'linux',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: false,
            remoteDebuggingEnabled: false,
            runtimeVersion: 'PHP|7.3',
            sortOrder: 0,
            githubActionSettings: {
              supported: false,
            },
          },
          {
            os: 'windows',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: true,
            remoteDebuggingEnabled: false,
            runtimeVersion: '7.3',
            sortOrder: 1,
            githubActionSettings: {
              supported: false,
            },
          },
        ],
      },
      {
        displayText: 'PHP 7.2',
        value: '7.2',
        sortOrder: 1,
        supportedPlatforms: [
          {
            os: 'linux',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: false,
            remoteDebuggingEnabled: false,
            runtimeVersion: 'PHP|7.2',
            sortOrder: 0,
            githubActionSettings: {
              supported: false,
            },
          },
          {
            os: 'windows',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: true,
            remoteDebuggingEnabled: false,
            runtimeVersion: '7.2',
            sortOrder: 1,
            githubActionSettings: {
              supported: false,
            },
          },
        ],
      },
    ],
  };

  private _netCoreStacks: WebAppCreateStack = {
    displayText: '.NET Core',
    value: 'DOTNETCORE',
    sortOrder: 4,
    versions: [
      {
        displayText: '.NET Core 3.1 (LTS)',
        value: 'DotnetCore3.1',
        sortOrder: 0,
        supportedPlatforms: [
          {
            os: 'linux',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: false,
            remoteDebuggingEnabled: false,
            runtimeVersion: 'DOTNETCORE|3.1',
            sortOrder: 1,
            githubActionSettings: {
              supported: true,
              recommendedVersion: '3.1.102',
            },
          },
        ],
      },
      {
        displayText: '.NET Core 3.0',
        value: 'DotnetCore3.0',
        sortOrder: 1,
        supportedPlatforms: [
          {
            os: 'windows',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: true,
            remoteDebuggingEnabled: false,
            runtimeVersion: '3.0',
            sortOrder: 0,
            githubActionSettings: {
              supported: true,
              recommendedVersion: '3.0.103',
            },
          },
          {
            os: 'linux',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: false,
            remoteDebuggingEnabled: false,
            runtimeVersion: 'DOTNETCORE|3.0',
            sortOrder: 1,
            githubActionSettings: {
              supported: true,
              recommendedVersion: '3.0.103',
            },
          },
        ],
      },
      {
        displayText: '.NET Core 2.1 (LTS)',
        value: 'DotnetCore2.1',
        sortOrder: 2,
        supportedPlatforms: [
          {
            os: 'windows',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: true,
            remoteDebuggingEnabled: false,
            runtimeVersion: '2.1',
            sortOrder: 0,
            githubActionSettings: {
              supported: true,
              recommendedVersion: '2.1.804',
            },
          },
          {
            os: 'linux',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: false,
            remoteDebuggingEnabled: false,
            runtimeVersion: 'DOTNETCORE|2.1',
            sortOrder: 1,
            githubActionSettings: {
              supported: true,
              recommendedVersion: '2.1.804',
            },
          },
        ],
      },
    ],
  };

  private _rubyStacks: WebAppCreateStack = {
    displayText: 'Ruby',
    value: 'Ruby',
    sortOrder: 5,
    versions: [
      {
        displayText: 'Ruby 2.6',
        value: '2.6',
        sortOrder: 0,
        supportedPlatforms: [
          {
            os: 'linux',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: false,
            remoteDebuggingEnabled: false,
            runtimeVersion: 'RUBY|2.6',
            sortOrder: 0,
            githubActionSettings: {
              supported: false,
            },
          },
        ],
      },
      {
        displayText: 'Ruby 2.5',
        value: '2.5',
        sortOrder: 0,
        supportedPlatforms: [
          {
            os: 'linux',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: false,
            remoteDebuggingEnabled: false,
            runtimeVersion: 'RUBY|2.5',
            sortOrder: 1,
            githubActionSettings: {
              supported: false,
            },
          },
        ],
      },
      {
        displayText: 'Ruby 2.4',
        value: '2.4',
        sortOrder: 0,
        supportedPlatforms: [
          {
            os: 'linux',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: false,
            remoteDebuggingEnabled: false,
            runtimeVersion: 'RUBY|2.4',
            sortOrder: 2,
            githubActionSettings: {
              supported: false,
            },
          },
        ],
      },
    ],
  };

  private _java8Stacks: WebAppCreateStack = {
    displayText: 'Java 8',
    value: 'Java-8',
    sortOrder: 6,
    versions: [
      {
        displayText: 'Tomcat 8.5',
        value: 'Tomcat8.5Auto',
        sortOrder: 2,
        supportedPlatforms: [
          {
            os: 'linux',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: true,
            remoteDebuggingEnabled: false,
            runtimeVersion: 'TOMCAT|8.5-jre8',
            sortOrder: 0,
            githubActionSettings: {
              supported: true,
              recommendedVersion: '8',
            },
          },
          {
            os: 'windows',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: false,
            remoteDebuggingEnabled: false,
            runtimeVersion: '1.8|Tomcat|8.5',
            sortOrder: 1,
            githubActionSettings: {
              supported: true,
              recommendedVersion: '8',
            },
          },
        ],
      },
      {
        displayText: 'Tomcat 9.0',
        value: 'Tomcat9.0Auto',
        sortOrder: 1,
        supportedPlatforms: [
          {
            os: 'linux',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: true,
            remoteDebuggingEnabled: false,
            runtimeVersion: 'TOMCAT|9.0-jre8',
            sortOrder: 0,
            githubActionSettings: {
              supported: true,
              recommendedVersion: '8',
            },
          },
          {
            os: 'windows',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: false,
            remoteDebuggingEnabled: false,
            runtimeVersion: '1.8|Tomcat|9.0',
            sortOrder: 1,
            githubActionSettings: {
              supported: true,
              recommendedVersion: '8',
            },
          },
        ],
      },
      {
        displayText: 'Java SE',
        value: 'JavaSEAuto',
        sortOrder: 0,
        supportedPlatforms: [
          {
            os: 'linux',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: true,
            remoteDebuggingEnabled: false,
            runtimeVersion: 'JAVA|8-jre8',
            sortOrder: 0,
            githubActionSettings: {
              supported: true,
              recommendedVersion: '8',
            },
          },
          {
            os: 'windows',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: false,
            remoteDebuggingEnabled: false,
            runtimeVersion: '1.8|JAVA|8',
            sortOrder: 1,
            githubActionSettings: {
              supported: true,
              recommendedVersion: '8',
            },
          },
        ],
      },
    ],
  };

  private _java11Stacks: WebAppCreateStack = {
    displayText: 'Java 11',
    value: 'Java-11',
    sortOrder: 7,
    versions: [
      {
        displayText: 'Tomcat 8.5',
        value: 'Tomcat8.5Auto',
        sortOrder: 1,
        supportedPlatforms: [
          {
            os: 'linux',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: true,
            remoteDebuggingEnabled: false,
            runtimeVersion: 'TOMCAT|8.5-java11',
            sortOrder: 0,
            githubActionSettings: {
              supported: true,
              recommendedVersion: '11',
            },
          },
          {
            os: 'windows',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: false,
            remoteDebuggingEnabled: false,
            runtimeVersion: '11|Tomcat|8.5',
            sortOrder: 1,
            githubActionSettings: {
              supported: true,
              recommendedVersion: '11',
            },
          },
        ],
      },
      {
        displayText: 'Tomcat 9.0',
        value: 'Tomcat9.0Auto',
        sortOrder: 2,
        supportedPlatforms: [
          {
            os: 'linux',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: true,
            remoteDebuggingEnabled: false,
            runtimeVersion: 'TOMCAT|9.0-java11',
            sortOrder: 0,
            githubActionSettings: {
              supported: true,
              recommendedVersion: '11',
            },
          },
          {
            os: 'windows',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: false,
            remoteDebuggingEnabled: false,
            runtimeVersion: '11|Tomcat|9.0',
            sortOrder: 1,
            githubActionSettings: {
              supported: true,
              recommendedVersion: '11',
            },
          },
        ],
      },
      {
        displayText: 'Java SE',
        value: 'JavaSEAuto',
        sortOrder: 0,
        supportedPlatforms: [
          {
            os: 'linux',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: true,
            remoteDebuggingEnabled: false,
            runtimeVersion: 'JAVA|11-java11',
            sortOrder: 0,
            githubActionSettings: {
              supported: true,
              recommendedVersion: '11',
            },
          },
          {
            os: 'windows',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: false,
            remoteDebuggingEnabled: false,
            runtimeVersion: '11|JAVA|SE',
            sortOrder: 1,
            githubActionSettings: {
              supported: true,
              recommendedVersion: '11',
            },
          },
        ],
      },
    ],
  };

  getStacks(os?: 'linux' | 'windows'): WebAppCreateStack[] {
    const stacks = JSON.parse(
      JSON.stringify([
        this._aspNetStacks,
        this._nodeStacks,
        this._pythonStacks,
        this._phpStacks,
        this._netCoreStacks,
        this._rubyStacks,
        this._java8Stacks,
        this._java11Stacks,
      ])
    );

    if (!os) {
      return stacks;
    } else {
      // remove all supported platforms which do not support the provided os.
      stacks.forEach(stack =>
        stack.versions.forEach(version =>
          ArrayUtil.remove<WebAppCreateStackVersionPlatform>(version.supportedPlatforms, platform => platform.os !== os)
        )
      );

      // remove all versions which do not have any platforms.
      stacks.forEach(stack =>
        ArrayUtil.remove<WebAppCreateStackVersion>(stack.versions, version => version.supportedPlatforms.length === 0)
      );

      // remove all stacks which do not have any versions.
      ArrayUtil.remove<WebAppCreateStack>(stacks, stackItem => stackItem.versions.length === 0);

      return stacks;
    }
  }
}
