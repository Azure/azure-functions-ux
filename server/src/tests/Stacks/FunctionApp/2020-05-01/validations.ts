import * as chai from 'chai';
const expect = chai.expect;

export function validateAllStackLength(stacks) {
  expect(stacks).to.be.an('array');
  expect(stacks.length).to.equal(5);
}

export function validateDotnetCoreStack(stacks) {
  validateAllStackLength(stacks);
  const dotnetCoreStack = stacks[0];
  expect(dotnetCoreStack.displayText).to.equal('.NET Core');
  expect(dotnetCoreStack.value).to.equal('dotnet');
  expect(dotnetCoreStack.sortOrder).to.equal(0);
  expect(dotnetCoreStack.versions.length).to.equal(1);
}

export function validateNodeStack(stacks) {
  validateAllStackLength(stacks);
  const nodeStack = stacks[1];
  expect(nodeStack.displayText).to.equal('Node.js');
  expect(nodeStack.value).to.equal('node');
  expect(nodeStack.sortOrder).to.equal(1);
  expect(nodeStack.versions.length).to.equal(2);
}

export function validatePythonStack(stacks) {
  validateAllStackLength(stacks);
  const pythonStack = stacks[2];
  expect(pythonStack.displayText).to.equal('Python');
  expect(pythonStack.value).to.equal('python');
  expect(pythonStack.sortOrder).to.equal(2);
  expect(pythonStack.versions.length).to.equal(3);
}

export function validateJavaStack(stacks) {
  validateAllStackLength(stacks);
  const java8Stack = stacks[3];
  expect(java8Stack.displayText).to.equal('Java');
  expect(java8Stack.value).to.equal('java');
  expect(java8Stack.sortOrder).to.equal(3);
  expect(java8Stack.versions.length).to.equal(2);
}

export function validatePowershellCoreStack(stacks) {
  validateAllStackLength(stacks);
  const powershellStack = stacks[4];
  expect(powershellStack.displayText).to.equal('PowerShell Core');
  expect(powershellStack.value).to.equal('powershell');
  expect(powershellStack.sortOrder).to.equal(4);
  expect(powershellStack.versions.length).to.equal(2);
}
