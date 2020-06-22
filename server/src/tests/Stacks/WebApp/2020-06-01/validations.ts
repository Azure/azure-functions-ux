import * as chai from 'chai';
const expect = chai.expect;

export function validateAllStackLength(stacks) {
  expect(stacks).to.be.an('array');
  expect(stacks.length).to.equal(8);
}

export function validateWindowsStackLength(stacks) {
  expect(stacks).to.be.an('array');
  expect(stacks.length).to.equal(7);
}

export function validateLinuxStackLength(stacks) {
  expect(stacks).to.be.an('array');
  expect(stacks.length).to.equal(7);
}

export function validateASPStack(stacks) {
  validateAllStackLength(stacks);
  const aspStack = stacks[0];
  expect(aspStack.displayText).to.equal('ASP.NET');
  expect(aspStack.value).to.equal('ASP.NET');
  expect(aspStack.preferredOs).to.equal('windows');
  expect(aspStack.majorVersions.length).to.equal(2);
}

export function validateNodeStack(stacks) {
  validateAllStackLength(stacks);
  const nodeStack = stacks[1];
  expect(nodeStack.displayText).to.equal('Node');
  expect(nodeStack.value).to.equal('Node');
  expect(nodeStack.preferredOs).to.equal('linux');
  expect(nodeStack.majorVersions.length).to.equal(8);
}

export function validatePythonStack(stacks) {
  validateAllStackLength(stacks);
  const pythonStack = stacks[2];
  expect(pythonStack.displayText).to.equal('Python');
  expect(pythonStack.value).to.equal('Python');
  expect(pythonStack.preferredOs).to.equal('linux');
  expect(pythonStack.majorVersions.length).to.equal(2);
}

export function validatePHPStack(stacks) {
  validateAllStackLength(stacks);
  const phpStack = stacks[3];
  expect(phpStack.displayText).to.equal('PHP');
  expect(phpStack.value).to.equal('PHP');
  expect(phpStack.preferredOs).to.equal('linux');
  expect(phpStack.majorVersions.length).to.equal(2);
}

export function validateDotnetCoreStack(stacks) {
  validateAllStackLength(stacks);
  const dotnetCoreStack = stacks[4];
  expect(dotnetCoreStack.displayText).to.equal('.NET Core');
  expect(dotnetCoreStack.value).to.equal('.NET Core');
  expect(dotnetCoreStack.preferredOs).to.equal('windows');
  expect(dotnetCoreStack.majorVersions.length).to.equal(3);
}

export function validateRubyStack(stacks) {
  validateAllStackLength(stacks);
  const rubyStack = stacks[5];
  expect(rubyStack.displayText).to.equal('Ruby');
  expect(rubyStack.value).to.equal('Ruby');
  expect(rubyStack.preferredOs).to.equal('linux');
  expect(rubyStack.majorVersions.length).to.equal(4);
}

export function validateJavaStack(stacks) {
  validateAllStackLength(stacks);
  const javaStack = stacks[6];
  expect(javaStack.displayText).to.equal('Java');
  expect(javaStack.value).to.equal('Java');
  expect(javaStack.preferredOs).to.equal('linux');
  expect(javaStack.majorVersions.length).to.equal(3);
}

export function validateJavaContainersStack(stacks) {
  validateAllStackLength(stacks);
  const javaContainersStack = stacks[7];
  expect(javaContainersStack.displayText).to.equal('Java Containers');
  expect(javaContainersStack.value).to.equal('Java Containers');
  expect(javaContainersStack.preferredOs).to.equal(undefined);
  expect(javaContainersStack.majorVersions.length).to.equal(8);
}
