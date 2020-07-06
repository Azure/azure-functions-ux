import * as chai from 'chai';
const expect = chai.expect;

export function validateAllStackLength(stacks) {
  expect(stacks).to.be.an('array');
  expect(stacks.length).to.equal(6);
}

export function validateWindowsStackLength(stacks) {
  expect(stacks).to.be.an('array');
  expect(stacks.length).to.equal(5);
}

export function validateLinuxStackLength(stacks) {
  expect(stacks).to.be.an('array');
  expect(stacks.length).to.equal(4);
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
}

export function validateDotnetFrameworkInStacks(stacks) {
  validateAllStackLength(stacks);
  validateDotnetFrameworkStack(stacks[5]);
}

export function validateDotnetFrameworkStackFilter(stacks) {
  validateFilterStackLength(stacks);
  validateDotnetFrameworkStack(stacks[0]);
}

function validateDotnetFrameworkStack(dotnetCoreStack) {
  expect(dotnetCoreStack.displayText).to.equal('.NET Framework');
  expect(dotnetCoreStack.value).to.equal('dotnetFramework');
  expect(dotnetCoreStack.preferredOs).to.equal('windows');
  expect(dotnetCoreStack.majorVersions.length).to.equal(1);
}
