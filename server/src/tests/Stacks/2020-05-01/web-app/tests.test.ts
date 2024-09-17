import { StacksService20200501 } from '../../../../stacks/2020-05-01/service/StackService';
import {
  validateCreateStackLength,
  validateGithubActionStackLength,
  validateGithubActionWindowsStackLength,
  validateGithubActionLinuxStackLength,
  validateASPCreateStack,
  validateNodeCreateStack,
  validatePythonCreateStack,
  validatePHPCreateStack,
  validateDotnetCoreCreateStack,
  validateRubyCreateStack,
  validateJava8CreateStack,
  validateJava11CreateStack,
} from './validations';

const stacksService = new StacksService20200501();

describe('WebApp Stacks Test 2020-05-01', () => {
  // Test length of create stacks
  describe('Test Create stack length', () => {
    it('should validate all create stacks are returned', done => {
      const stacks = stacksService.getWebAppCreateStacks();
      validateCreateStackLength(stacks);
      done();
    });
  });

  // Test length of github action stacks
  describe('Test GitHub Actions stack length', () => {
    it('should validate all GitHub Action stacks are returned', done => {
      const stacks = stacksService.getWebAppGitHubActionStacks();
      validateGithubActionStackLength(stacks);
      done();
    });
  });

  // Test length of github action stacks windows
  describe('Test GitHub Actions stack length for Windows', () => {
    it('should validate all GitHub Action stacks with windows are returned', done => {
      const stacks = stacksService.getWebAppGitHubActionStacks('windows');
      validateGithubActionWindowsStackLength(stacks);
      done();
    });
  });

  // Test length of github action stacks linux
  describe('Test GitHub Actions stack length for Linux', () => {
    it('should validate all GitHub Action stacks with linux are returned', done => {
      const stacks = stacksService.getWebAppGitHubActionStacks('linux');
      validateGithubActionLinuxStackLength(stacks);
      done();
    });
  });

  // Test ASP stack Create/GHA
  describe('Test the Create/GitHub Action ASP stack', () => {
    it('should validate the ASP stack for Create and GitHub Actions', done => {
      const stacks = stacksService.getWebAppCreateStacks();
      validateASPCreateStack(stacks);
      done();
    });
  });

  // Test Node stack Create/GHA
  describe('Test the Create/GitHub Action Node stack', () => {
    it('should validate the Node stack for Create and GitHub Actions', done => {
      const stacks = stacksService.getWebAppCreateStacks();
      validateNodeCreateStack(stacks);
      done();
    });
  });

  // Test Python stack Create/GHA
  describe('Test the Create/GitHub Action Python stack', () => {
    it('should validate the Python stack for Create and GitHub Actions', done => {
      const stacks = stacksService.getWebAppCreateStacks();
      validatePythonCreateStack(stacks);
      done();
    });
  });

  // Test PHP stack Create/GHA
  describe('Test the Create/GitHub Action PHP stack', () => {
    it('should validate the PHP stack for Create and GitHub Actions', done => {
      const stacks = stacksService.getWebAppCreateStacks();
      validatePHPCreateStack(stacks);
      done();
    });
  });

  // Test .NET Core stack Create/GHA
  describe('Test the Create/GitHub Action .NET Core stack', () => {
    it('should validate the .NET Core stack for Create and GitHub Actions', done => {
      const stacks = stacksService.getWebAppCreateStacks();
      validateDotnetCoreCreateStack(stacks);
      done();
    });
  });

  // Test Ruby stack Create/GHA
  describe('Test the Create/GitHub Action Ruby stack', () => {
    it('should validate the Ruby stack for Create and GitHub Actions', done => {
      const stacks = stacksService.getWebAppCreateStacks();
      validateRubyCreateStack(stacks);
      done();
    });
  });

  // Test Java 8 stack Create/GHA
  describe('Test the Create/GitHub Action Java 8 stack', () => {
    it('should validate the Java 8 stack for Create and GitHub Actions', done => {
      const stacks = stacksService.getWebAppCreateStacks();
      validateJava8CreateStack(stacks);
      done();
    });
  });

  // Test Java 11 stack Create/GHA
  describe('Test the Create/GitHub Action Java 11 stack', () => {
    it('should validate the Java 11 stack for Create and GitHub Actions', done => {
      const stacks = stacksService.getWebAppCreateStacks();
      validateJava11CreateStack(stacks);
      done();
    });
  });
});
