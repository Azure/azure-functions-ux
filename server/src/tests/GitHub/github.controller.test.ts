import { expect } from 'chai';
import { DeploymentCenterService } from '../../../src/deployment-center/deployment-center.service';
import { ConfigService } from '../../shared/config/config.service';
import { LoggingService } from '../../shared/logging/logging.service';
import { HttpService } from '../../shared/http/http.service';
import { GithubController } from '../../../src/deployment-center/github/github.controller';
import { GitHubFileSearchMockData } from './githubFileSearchMock';
import { gitHubTreeCallMockResponse } from './github.controller.utility';
import { Mocked, fn } from 'jest-mock';
import { AxiosPromise } from 'axios';

describe('GitHub controller test', () => {
  let githubController: GithubController;
  let httpServiceMock: Mocked<HttpService>;
  let loggingServiceMock: LoggingService;
  let configService: ConfigService;
  let dcService: DeploymentCenterService;

  beforeEach(() => {
    httpServiceMock = ({
      get: fn(),
    } as unknown) as Mocked<HttpService>;
    loggingServiceMock = new LoggingService();
    configService = new ConfigService(httpServiceMock);
    dcService = new DeploymentCenterService(loggingServiceMock, configService, httpServiceMock);
    githubController = new GithubController(dcService, configService, loggingServiceMock, httpServiceMock);
  });

  afterEach(function() {
    httpServiceMock.get.mockReset();
  });

  describe('searchGitHubFile', () => {
    const userName = 'testUser';
    const repoName = 'testRepo';
    const branchName = 'main';
    const gitHubToken = 'fakeToken';
    const fileNameToLookFor = 'fileNameToLookFor.config.json';
    const missingFileName = 'missingFileName.config.json';
    const baseFilePath = '/';
    const baseClientPath = '/client';

    const {
      baseRootFolder,
      srcFolder,
      clientFolder,
      baseClientFolder,
      publicFolder,
      publicSub1Folder,
      publicSub2Folder,
      publicSub3Folder,
    } = GitHubFileSearchMockData;

    describe('_getFoldersInBaseFileLocation', () => {
      it('Should return an expected array ', async () => {
        httpServiceMock.get.mockImplementation(url => {
          if (url === `${(githubController as any).githubApiUrl}/repos/${userName}/${repoName}/git/trees/${branchName}`) {
            return Promise.resolve(gitHubTreeCallMockResponse(baseRootFolder)) as AxiosPromise;
          }
          return Promise.reject(new Error(`Unexpected URL`)) as AxiosPromise;
        });

        const foldersInBase = await (githubController as any)._getFoldersInBaseFileLocation(
          userName,
          repoName,
          branchName,
          gitHubToken,
          baseFilePath
        );
        expect(foldersInBase).to.deep.equal(baseRootFolder);
      });
    });

    describe('_getFolderPathHelper', () => {
      it('Should find fileNameToLookFor.config.json under a subfolder.', async () => {
        httpServiceMock.get.mockImplementation((url: string) => {
          if (url === 'https://api.github.com/clientFolder') {
            return Promise.resolve(gitHubTreeCallMockResponse(clientFolder)) as AxiosPromise;
          } else if (url === 'https://api.github.com/srcFolder') {
            return Promise.resolve(gitHubTreeCallMockResponse(srcFolder)) as AxiosPromise;
          }
          return Promise.reject(new Error('Unexpected URL'));
        });

        const { isFound, folderPath } = await (githubController as any)._getFolderPathHelper(
          baseFilePath,
          baseRootFolder,
          gitHubToken,
          fileNameToLookFor,
          baseFilePath
        );

        expect(isFound).to.be.true;
        expect(folderPath).to.equal('/client');
      });
    });

    describe('_searchSpecifiedGitHubFile', () => {
      it('Should find fileNameToLookFor.config.json under the base file path', async () => {
        httpServiceMock.get.mockImplementation(url => {
          if (
            url ===
            `${
              (githubController as any).githubApiUrl
            }/repos/${userName}/${repoName}/git/trees/${branchName}:${(githubController as any)._trimFilePath(baseClientPath)}`
          ) {
            return Promise.resolve(gitHubTreeCallMockResponse(clientFolder)) as AxiosPromise;
          }
          return Promise.reject(new Error('Unexpected URL')) as AxiosPromise;
        });

        const { isFound, folderPath } = await (githubController as any)._searchSpecifiedGitHubFile(
          userName,
          repoName,
          branchName,
          gitHubToken,
          fileNameToLookFor,
          baseClientPath
        );

        expect(isFound).to.be.true;
        expect(folderPath).to.equal('/client');
      });

      it('Should find fileNameToLookFor.config.json under a nested subfolder', async () => {
        httpServiceMock.get.mockImplementation(url => {
          switch (url) {
            case `${
              (githubController as any).githubApiUrl
            }/repos/${userName}/${repoName}/git/trees/${branchName}:${(githubController as any)._trimFilePath(baseClientPath)}`:
              return Promise.resolve(gitHubTreeCallMockResponse(baseClientFolder)) as AxiosPromise;
            case 'https://api.github.com/srcFolder':
              return Promise.resolve(gitHubTreeCallMockResponse(srcFolder)) as AxiosPromise;
            case 'https://api.github.com/publicFolder':
              return Promise.resolve(gitHubTreeCallMockResponse(publicFolder)) as AxiosPromise;
            case 'https://api.github.com/publicSub1Folder':
              return Promise.resolve(gitHubTreeCallMockResponse(publicSub1Folder)) as AxiosPromise;
            case 'https://api.github.com/publicSub2Folder':
              return Promise.resolve(gitHubTreeCallMockResponse(publicSub2Folder)) as AxiosPromise;
            case 'https://api.github.com/publicSub3Folder':
              return Promise.resolve(gitHubTreeCallMockResponse(publicSub3Folder)) as AxiosPromise;
            default:
              return Promise.reject(new Error('Not Found'));
          }
        });

        const { isFound, folderPath } = await (githubController as any)._searchSpecifiedGitHubFile(
          userName,
          repoName,
          branchName,
          gitHubToken,
          fileNameToLookFor,
          baseClientPath
        );

        expect(isFound).to.be.true;
        expect(folderPath).to.equal('/client/public/publicSub3');
      });

      it('Should not find missingFileName.config.json.', async () => {
        httpServiceMock.get.mockImplementation(url => {
          if (url === `${(githubController as any).githubApiUrl}/repos/${userName}/${repoName}/git/trees/${branchName}`) {
            return Promise.resolve(gitHubTreeCallMockResponse(baseRootFolder)) as AxiosPromise;
          } else if (url === 'https://api.github.com/srcFolder') {
            return Promise.resolve(gitHubTreeCallMockResponse(srcFolder)) as AxiosPromise;
          } else if (url === 'https://api.github.com/clientFolder') {
            return Promise.resolve(gitHubTreeCallMockResponse(clientFolder)) as AxiosPromise;
          } else {
            return Promise.reject(new Error('Not Found'));
          }
        });

        const { isFound, folderPath } = await (githubController as any)._searchSpecifiedGitHubFile(
          userName,
          repoName,
          branchName,
          gitHubToken,
          missingFileName,
          baseFilePath
        );

        expect(isFound).to.be.false;
        expect(folderPath).to.equal(undefined);
      });
    });

    describe('searchGitHubFile', () => {
      it('Should throw an error if any required property is missing.', async () => {
        try {
          await (githubController as any).searchGitHubFile(gitHubToken, userName, repoName, branchName, fileNameToLookFor, '');
        } catch (error) {
          expect(error.message).to.include('One or more required parameters are missing', `actual: ${error.message}`);
          expect(error.status).to.equal(400);
        }
      });
    });
  });
});
