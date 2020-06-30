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

export function validateDotnetCoreStack(stacks) {
  validateAllStackLength(stacks);
  const dotnetCoreStack = stacks[0];
  expect(dotnetCoreStack.displayText).to.equal('.NET Core');
  expect(dotnetCoreStack.value).to.equal('dotnetCore');
  expect(dotnetCoreStack.preferredOs).to.equal('windows');
  expect(dotnetCoreStack.majorVersions.length).to.equal(2);
}

export function validateNodeStack(stacks) {
  validateAllStackLength(stacks);
  const nodeStack = stacks[1];
  expect(nodeStack.displayText).to.equal('Node.js');
  expect(nodeStack.value).to.equal('node');
  expect(nodeStack.preferredOs).to.equal('windows');
  expect(nodeStack.majorVersions.length).to.equal(4);
}

export function validatePythonStack(stacks) {
  validateAllStackLength(stacks);
  const pythonStack = stacks[2];
  expect(pythonStack.displayText).to.equal('Python');
  expect(pythonStack.value).to.equal('python');
  expect(pythonStack.preferredOs).to.equal('linux');
  expect(pythonStack.majorVersions.length).to.equal(1);
}

export function validateJavaStack(stacks) {
  validateAllStackLength(stacks);
  const javaStack = stacks[3];
  expect(javaStack.displayText).to.equal('Java');
  expect(javaStack.value).to.equal('java');
  expect(javaStack.preferredOs).to.equal('windows');
  expect(javaStack.majorVersions.length).to.equal(2);
}

export function validatePowershellStack(stacks) {
  validateAllStackLength(stacks);
  const powershellStack = stacks[4];
  expect(powershellStack.displayText).to.equal('PowerShell');
  expect(powershellStack.value).to.equal('powershell');
  expect(powershellStack.preferredOs).to.equal('windows');
  expect(powershellStack.majorVersions.length).to.equal(2);
}

export function validateDotnetFrameworkStack(stacks) {
  validateAllStackLength(stacks);
  const dotnetCoreStack = stacks[5];
  expect(dotnetCoreStack.displayText).to.equal('.NET Framework');
  expect(dotnetCoreStack.value).to.equal('dotnetFramework');
  expect(dotnetCoreStack.preferredOs).to.equal('windows');
  expect(dotnetCoreStack.majorVersions.length).to.equal(1);
}
