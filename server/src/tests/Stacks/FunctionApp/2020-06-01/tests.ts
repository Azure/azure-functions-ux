import { FunctionAppStacksService20200601 } from '../../../../stacks/functionapp/2020-06-01/stacks.service';
import {
  validateAllStackLength,
  validateWindowsStackLength,
  validateLinuxStackLength,
  validateDotnetCoreInStacks,
  validateNodeInStacks,
  validatePythonInStacks,
  validateJavaInStacks,
  validatePowershellInStacks,
  validateDotnetFrameworkInStacks,
  validateDotnetCoreFilter,
  validateNodeStackFilter,
  validatePythonStackFilter,
  validateJavaStackFilter,
  validatePowershellStackFilter,
  validateDotnetFrameworkStackFilter,
} from './validations';

const functionAppStacksService = new FunctionAppStacksService20200601();

describe('FunctionApp Stacks Test 2020-06-01', () => {
  // Test length of all stacks
  describe('Test all stack length', () => {
    it('should validate all stacks are returned', done => {
      const stacks = functionAppStacksService.getStacks();
      validateAllStackLength(stacks);
      done();
    });
  });

  // Test length of windows stacks
  describe('Test windows stack length', () => {
    it('should validate all stacks with windows are returned', done => {
      const stacks = functionAppStacksService.getStacks('windows');
      validateWindowsStackLength(stacks);
      done();
    });
  });

  // Test length of linux stacks
  describe('Test linux stack length', () => {
    it('should validate all stacks with linux are returned', done => {
      const stacks = functionAppStacksService.getStacks('linux');
      validateLinuxStackLength(stacks);
      done();
    });
  });

  // Test .NET Core stack
  describe('Test the .NET Core stack', () => {
    it('should validate the .NET Core stack', done => {
      const stacks = functionAppStacksService.getStacks();
      validateDotnetCoreInStacks(stacks);
      done();
    });
  });

  // Test .NET Core stack filter
  describe('Test the .NET Core stack filter', () => {
    it('should validate the .NET Core stack filter', done => {
      const stacks = functionAppStacksService.getStacks(undefined, 'dotnetCore');
      validateDotnetCoreFilter(stacks);
      done();
    });
  });

  // Test Node stack
  describe('Test the Node.js stack', () => {
    it('should validate the Node.js stack', done => {
      const stacks = functionAppStacksService.getStacks();
      validateNodeInStacks(stacks);
      done();
    });
  });

  // Test Node stack filter
  describe('Test the Node.js stack filter', () => {
    it('should validate the Node.js stack filter', done => {
      const stacks = functionAppStacksService.getStacks(undefined, 'node');
      validateNodeStackFilter(stacks);
      done();
    });
  });

  // Test Python stack
  describe('Test the Python stack', () => {
    it('should validate the Python stack', done => {
      const stacks = functionAppStacksService.getStacks();
      validatePythonInStacks(stacks);
      done();
    });
  });

  // Test Python stack filter
  describe('Test the Python stack filter', () => {
    it('should validate the Python stack filter', done => {
      const stacks = functionAppStacksService.getStacks(undefined, 'python');
      validatePythonStackFilter(stacks);
      done();
    });
  });

  // Test Java stack
  describe('Test the Java stack', () => {
    it('should validate the Java stack', done => {
      const stacks = functionAppStacksService.getStacks();
      validateJavaInStacks(stacks);
      done();
    });
  });

  // Test Java stack filter
  describe('Test the Java stack filter', () => {
    it('should validate the Java stack filter', done => {
      const stacks = functionAppStacksService.getStacks(undefined, 'java');
      validateJavaStackFilter(stacks);
      done();
    });
  });

  // Test PowerShell stack
  describe('Test the PowerShell stack', () => {
    it('should validate the PowerShell stack', done => {
      const stacks = functionAppStacksService.getStacks();
      validatePowershellInStacks(stacks);
      done();
    });
  });

  // Test PowerShell stack filter
  describe('Test the PowerShell stack filter', () => {
    it('should validate the PowerShell stack filter', done => {
      const stacks = functionAppStacksService.getStacks(undefined, 'powershell');
      validatePowershellStackFilter(stacks);
      done();
    });
  });

  // Test .NET Framework stack
  describe('Test the .NET Framework stack', () => {
    it('should validate the .NET Framework stack', done => {
      const stacks = functionAppStacksService.getStacks();
      validateDotnetFrameworkInStacks(stacks);
      done();
    });
  });

  // Test .NET Framework stack filter
  describe('Test the .NET Framework stack filter', () => {
    it('should validate the .NET Framework stack', done => {
      const stacks = functionAppStacksService.getStacks(undefined, 'dotnetFramework');
      validateDotnetFrameworkStackFilter(stacks);
      done();
    });
  });
});
