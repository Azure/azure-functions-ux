import { StacksService20200501 } from '../../../../stacks/2020-05-01/service/StackService';
import {
  validateAllStackLength,
  validateNonHiddenStackLength,
  validateDotnetCoreStack,
  validateNodeStack,
  validatePythonStack,
  validateJavaStack,
  validatePowershellCoreStack,
  validateCustomStack,
} from './validations';

const stacksService = new StacksService20200501();

describe('FunctionApp Stacks Test 2020-05-01', () => {
  // Test length of all stacks
  describe('Test all stack length', () => {
    it('should validate all stacks are returned', done => {
      const stacks = stacksService.getFunctionAppStacks();
      validateAllStackLength(stacks);
      done();
    });
  });

  // Test length of non-hidden stacks
  describe('Test non-hidden stack length', () => {
    it('should validate that hidden stacks are removed', done => {
      const stacks = stacksService.getFunctionAppStacks(true);
      validateNonHiddenStackLength(stacks);
      done();
    });
  });

  // Test .NET Core stack
  describe('Test the .NET Core stack', () => {
    it('should validate the .NET Core stack', done => {
      const stacks = stacksService.getFunctionAppStacks();
      validateDotnetCoreStack(stacks);
      done();
    });
  });

  // Test Node stack
  describe('Test the Node stack', () => {
    it('should validate the Node stack', done => {
      const stacks = stacksService.getFunctionAppStacks();
      validateNodeStack(stacks);
      done();
    });
  });

  // Test Python stack
  describe('Test the Python stack', () => {
    it('should validate the Python stack', done => {
      const stacks = stacksService.getFunctionAppStacks();
      validatePythonStack(stacks);
      done();
    });
  });

  // Test Java stack
  describe('Test the Java stack', () => {
    it('should validate the Java stack', done => {
      const stacks = stacksService.getFunctionAppStacks();
      validateJavaStack(stacks);
      done();
    });
  });

  // Test PowerShell Core stack
  describe('Test the PowerShell Core stack', () => {
    it('should validate the PowerShell Core stack', done => {
      const stacks = stacksService.getFunctionAppStacks();
      validatePowershellCoreStack(stacks);
      done();
    });
  });

  // Test Custom Core stack
  describe('Test the Custom stack', () => {
    it('should validate the Custom stack', done => {
      const stacks = stacksService.getFunctionAppStacks();
      validateCustomStack(stacks);
      done();
    });
  });
});
