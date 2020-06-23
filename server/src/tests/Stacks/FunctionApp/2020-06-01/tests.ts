import { FunctionAppStacksService20200601 } from '../../../../stacks/functionapp/2020-06-01/stacks.service';
import {
  validateAllStackLength,
  validateDotnetCoreStack,
  validateNodeStack,
  validatePythonStack,
  validateJavaStack,
  validatePowershellStack,
  validateDotnetFrameworkStack,
} from './validations';

const functionAppStacksService = new FunctionAppStacksService20200601();

describe('FunctionApp Stacks Test 2020-05-01', () => {
  // Test length of all stacks
  describe('Test all stack length', () => {
    it('should validate all stacks are returned', done => {
      const stacks = functionAppStacksService.getStacks();
      validateAllStackLength(stacks);
      done();
    });
  });

  // Test .NET Core stack
  describe('Test the .NET Core stack', () => {
    it('should validate the .NET Core stack', done => {
      const stacks = functionAppStacksService.getStacks();
      validateDotnetCoreStack(stacks);
      done();
    });
  });

  // Test Node stack
  describe('Test the Node.js stack', () => {
    it('should validate the Node.js stack', done => {
      const stacks = functionAppStacksService.getStacks();
      validateNodeStack(stacks);
      done();
    });
  });

  // Test Python stack
  describe('Test the Python stack', () => {
    it('should validate the Python stack', done => {
      const stacks = functionAppStacksService.getStacks();
      validatePythonStack(stacks);
      done();
    });
  });

  // Test Java stack
  describe('Test the Java stack', () => {
    it('should validate the Java stack', done => {
      const stacks = functionAppStacksService.getStacks();
      validateJavaStack(stacks);
      done();
    });
  });

  // Test PowerShell Core stack
  describe('Test the PowerShell Core stack', () => {
    it('should validate the PowerShell Core stack', done => {
      const stacks = functionAppStacksService.getStacks();
      validatePowershellStack(stacks);
      done();
    });
  });

  // Test .NET Framework stack
  describe('Test the .NET Framework stack', () => {
    it('should validate the .NET Framework stack', done => {
      const stacks = functionAppStacksService.getStacks();
      validateDotnetFrameworkStack(stacks);
      done();
    });
  });
});
