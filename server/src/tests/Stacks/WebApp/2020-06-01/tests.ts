import { WebAppStacksService20200601 } from '../../../../stacks/webapp/2020-06-01/stacks.service';
import {
  validateAllStackLength,
  validateWindowsStackLength,
  validateLinuxStackLength,
  validateASPStack,
  validateNodeStack,
  validatePythonStack,
  validatePHPStack,
  validateDotnetCoreStack,
  validateRubyStack,
  validateJavaStack,
  validateJavaContainersStack,
} from './validations';

const webAppStacksService = new WebAppStacksService20200601();

describe('WebApp Stacks Test 2020-06-01', () => {
  // Test length of all stacks
  describe('Test all stack length', () => {
    it('should validate all stacks are returned', done => {
      const stacks = webAppStacksService.getStacks();
      validateAllStackLength(stacks);
      done();
    });
  });

  // Test length of windows stacks
  describe('Test windows stack length', () => {
    it('should validate all stacks with windows are returned', done => {
      const stacks = webAppStacksService.getStacks('windows');
      validateWindowsStackLength(stacks);
      done();
    });
  });

  // Test length of linux stacks
  describe('Test linux stack length', () => {
    it('should validate all stacks with linux are returned', done => {
      const stacks = webAppStacksService.getStacks('linux');
      validateLinuxStackLength(stacks);
      done();
    });
  });

  // Test ASP stack
  describe('Test the ASP stack', () => {
    it('should validate the ASP stack', done => {
      const stacks = webAppStacksService.getStacks();
      validateASPStack(stacks);
      done();
    });
  });

  // Test Node stack
  describe('Test the Node stack', () => {
    it('should validate the Node stack', done => {
      const stacks = webAppStacksService.getStacks();
      validateNodeStack(stacks);
      done();
    });
  });

  // Test Python stack
  describe('Test the Python stack', () => {
    it('should validate the Python stack', done => {
      const stacks = webAppStacksService.getStacks();
      validatePythonStack(stacks);
      done();
    });
  });

  // Test PHP stack
  describe('Test the PHP stack', () => {
    it('should validate the PHP stack', done => {
      const stacks = webAppStacksService.getStacks();
      validatePHPStack(stacks);
      done();
    });
  });

  // Test .NET Core stack
  describe('Test the .NET Core stack', () => {
    it('should validate the .NET Core stack', done => {
      const stacks = webAppStacksService.getStacks();
      validateDotnetCoreStack(stacks);
      done();
    });
  });

  // Test Ruby stack
  describe('Test the Ruby stack', () => {
    it('should validate the Ruby stack', done => {
      const stacks = webAppStacksService.getStacks();
      validateRubyStack(stacks);
      done();
    });
  });

  // Test Java stack
  describe('Test the Java stack', () => {
    it('should validate the Java stack', done => {
      const stacks = webAppStacksService.getStacks();
      validateJavaStack(stacks);
      done();
    });
  });

  // Test Java Containers stack
  describe('Test the Java Containers stack', () => {
    it('should validate the Java Containers stack', done => {
      const stacks = webAppStacksService.getStacks();
      validateJavaContainersStack(stacks);
      done();
    });
  });
});
