import * as chai from 'chai';
import { dotnetCoreStack as hardCodedDotnetCoreStack } from './../../../../stacks/functionapp/2020-06-01/stacks/dotnetCore';
import { nodeStack as hardCodedNodeStack } from './../../../../stacks/functionapp/2020-06-01/stacks/node';
import { pythonStack as hardCodedPythonStack } from './../../../../stacks/functionapp/2020-06-01/stacks/python';
import { javaStack as hardCodedJavaStack } from './../../../../stacks/functionapp/2020-06-01/stacks/java';
import { powershellStack as hardCodedPowershellStack } from './../../../../stacks/functionapp/2020-06-01/stacks/powershell';
import { dotnetFrameworkStack as hardCodedDotnetFrameworkStack } from './../../../../stacks/functionapp/2020-06-01/stacks/dotnetFramework';

const expect = chai.expect;

export function validateAllStackLength(stacks) {
  expect(stacks).to.be.an('array');
  expect(stacks.length).to.equal(7);
}

export function validateWindowsStacks(stacks) {
  validateWindowsStacksLength(stacks);
  validateStacksOnlyHaveCorrectOS(stacks, 'windows');
}

export function validateLinuxStacks(stacks) {
  validateLinuxStacksLength(stacks);
  validateStacksOnlyHaveCorrectOS(stacks, 'linux');
}

function validateWindowsStacksLength(stacks) {
  expect(stacks).to.be.an('array');
  expect(stacks.length).to.equal(6);
}

function validateLinuxStacksLength(stacks) {
  expect(stacks).to.be.an('array');
  expect(stacks.length).to.equal(5);
}

function validateStacksOnlyHaveCorrectOS(stacks, os: 'windows' | 'linux') {
  stacks.forEach(stack => {
    expect(stack.majorVersions).to.be.an('array');
    stack.majorVersions.forEach(majorVersion => {
      expect(majorVersion.minorVersions).to.be.an('array');
      majorVersion.minorVersions.forEach(minorVersion => {
        expect(minorVersion.stackSettings).to.have.property(os === 'windows' ? 'windowsRuntimeSettings' : 'linuxRuntimeSettings');
        expect(minorVersion.stackSettings).to.not.have.property(os === 'windows' ? 'linuxRuntimeSettings' : 'windowsRuntimeSettings');
      });
    });
  });
}

export function validateFilterStackLength(stacks) {
  expect(stacks).to.be.an('array');
  expect(stacks.length).to.equal(1);
}

export function validateDotnetCoreInStacks(stacks) {
  validateAllStackLength(stacks);
  validateDotnetCoreStack(stacks[0]);
}

export function validateDotnetCoreFilter(stacks) {
  validateFilterStackLength(stacks);
  validateDotnetCoreStack(stacks[0]);
}

function validateDotnetCoreStack(dotnetCoreStack) {
  expect(dotnetCoreStack.displayText).to.equal('.NET Core');
  expect(dotnetCoreStack.value).to.equal('dotnetCore');
  expect(dotnetCoreStack.preferredOs).to.equal('windows');
  expect(dotnetCoreStack.majorVersions.length).to.equal(2);
  expect(dotnetCoreStack).to.deep.equal(hardCodedDotnetCoreStack);
}

export function validateNodeInStacks(stacks) {
  validateAllStackLength(stacks);
  validateNodeStack(stacks[1]);
}

export function validateNodeStackFilter(stacks) {
  validateFilterStackLength(stacks);
  validateNodeStack(stacks[0]);
}

function validateNodeStack(nodeStack) {
  expect(nodeStack.displayText).to.equal('Node.js');
  expect(nodeStack.value).to.equal('node');
  expect(nodeStack.preferredOs).to.equal('windows');
  expect(nodeStack.majorVersions.length).to.equal(4);
  expect(nodeStack).to.deep.equal(hardCodedNodeStack);
}

export function validatePythonInStacks(stacks) {
  validateAllStackLength(stacks);
  validatePythonStack(stacks[2]);
}

export function validatePythonStackFilter(stacks) {
  validateFilterStackLength(stacks);
  validatePythonStack(stacks[0]);
}

function validatePythonStack(pythonStack) {
  expect(pythonStack.displayText).to.equal('Python');
  expect(pythonStack.value).to.equal('python');
  expect(pythonStack.preferredOs).to.equal('linux');
  expect(pythonStack.majorVersions.length).to.equal(1);
  expect(pythonStack).to.deep.equal(hardCodedPythonStack);
}

export function validateJavaInStacks(stacks) {
  validateAllStackLength(stacks);
  validateJavaStack(stacks[3]);
}

export function validateJavaStackFilter(stacks) {
  validateFilterStackLength(stacks);
  validateJavaStack(stacks[0]);
}

function validateJavaStack(javaStack) {
  expect(javaStack.displayText).to.equal('Java');
  expect(javaStack.value).to.equal('java');
  expect(javaStack.preferredOs).to.equal('windows');
  expect(javaStack.majorVersions.length).to.equal(2);
  expect(javaStack).to.deep.equal(hardCodedJavaStack);
}

export function validatePowershellInStacks(stacks) {
  validateAllStackLength(stacks);
  validatePowershellStack(stacks[4]);
}

export function validatePowershellStackFilter(stacks) {
  validateFilterStackLength(stacks);
  validatePowershellStack(stacks[0]);
}

function validatePowershellStack(powershellStack) {
  expect(powershellStack.displayText).to.equal('PowerShell');
  expect(powershellStack.value).to.equal('powershell');
  expect(powershellStack.preferredOs).to.equal('windows');
  expect(powershellStack.majorVersions.length).to.equal(2);
  expect(powershellStack).to.deep.equal(hardCodedPowershellStack);
}

export function validateDotnetFrameworkInStacks(stacks) {
  validateAllStackLength(stacks);
  validateDotnetFrameworkStack(stacks[5]);
}

export function validateDotnetFrameworkStackFilter(stacks) {
  validateFilterStackLength(stacks);
  validateDotnetFrameworkStack(stacks[0]);
}

function validateDotnetFrameworkStack(dotnetFrameworkStack) {
  expect(dotnetFrameworkStack.displayText).to.equal('.NET Framework');
  expect(dotnetFrameworkStack.value).to.equal('dotnetFramework');
  expect(dotnetFrameworkStack.preferredOs).to.equal('windows');
  expect(dotnetFrameworkStack.majorVersions.length).to.equal(1);
  expect(dotnetFrameworkStack).to.deep.equal(hardCodedDotnetFrameworkStack);
}

export function validateCustomInStacks(stacks) {
  validateAllStackLength(stacks);
  validateCustomStack(stacks[6]);
}

export function validateCustomStackFilter(stacks) {
  validateFilterStackLength(stacks);
  validateCustomStack(stacks[0]);
}

function validateCustomStack(dotnetCoreStack) {
  expect(dotnetCoreStack.displayText).to.equal('Custom');
  expect(dotnetCoreStack.value).to.equal('custom');
  expect(dotnetCoreStack.preferredOs).to.equal('windows');
  expect(dotnetCoreStack.majorVersions.length).to.equal(1);
}
