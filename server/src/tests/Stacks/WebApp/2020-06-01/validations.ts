import * as chai from 'chai';
import { aspDotnetStack as hardCodedAspDotnetStack } from './../../../../stacks/webapp/2020-06-01/stacks/aspDotnet';
import { nodeStack as hardCodedNodeStack } from './../../../../stacks/webapp/2020-06-01/stacks/node';
import { pythonStack as hardCodedPythonStack } from './../../../../stacks/webapp/2020-06-01/stacks/python';
import { phpStack as hardCodedPhpStack } from './../../../../stacks/webapp/2020-06-01/stacks/php';
import { dotnetCoreStack as hardCodedDotnetCoreStack } from './../../../../stacks/webapp/2020-06-01/stacks/dotnetCore';
import { rubyStack as hardCodedRubyStack } from './../../../../stacks/webapp/2020-06-01/stacks/ruby';
import { javaStack as hardCodedJavaStack } from './../../../../stacks/webapp/2020-06-01/stacks/java';
import { javaContainersStack as hardCodedJavaContainersStack } from './../../../../stacks/webapp/2020-06-01/stacks/javaContainers';

const expect = chai.expect;

export function validateAllStackLength(stacks) {
  expect(stacks).to.be.an('array');
  expect(stacks.length).to.equal(8);
}

export function validateWindowsStacks(stacks) {
  validateWindowsStackLength(stacks);
  validateStacksOnlyHaveCorrectOS(stacks, 'windows');
}

export function validateLinuxStacks(stacks) {
  validateLinuxStackLength(stacks);
  validateStacksOnlyHaveCorrectOS(stacks, 'linux');
}

function validateWindowsStackLength(stacks) {
  expect(stacks).to.be.an('array');
  expect(stacks.length).to.equal(7);
}

function validateLinuxStackLength(stacks) {
  expect(stacks).to.be.an('array');
  expect(stacks.length).to.equal(7);
}

function validateStacksOnlyHaveCorrectOS(stacks, os: 'windows' | 'linux') {
  stacks.forEach(stack => {
    expect(stack.majorVersions).to.be.an('array');
    stack.majorVersions.forEach(majorVersion => {
      expect(majorVersion.minorVersions).to.be.an('array');
      majorVersion.minorVersions.forEach(minorVersion => {
        expect(minorVersion.stackSettings).to.not.have.property(os === 'windows' ? 'linuxContainerSettings' : 'windowsContainerSettings');
        expect(minorVersion.stackSettings).to.not.have.property(os === 'windows' ? 'linuxRuntimeSettings' : 'windowsRuntimeSettings');
      });
    });
  });
}

export function validateASPStack(stacks) {
  validateAllStackLength(stacks);
  const aspDotnetStack = stacks[0];
  expect(aspDotnetStack.displayText).to.equal('ASP.NET');
  expect(aspDotnetStack.value).to.equal('aspnet');
  expect(aspDotnetStack.preferredOs).to.equal('windows');
  expect(aspDotnetStack.majorVersions.length).to.equal(2);
  expect(aspDotnetStack).to.deep.equal(hardCodedAspDotnetStack);
}

export function validateNodeStack(stacks) {
  validateAllStackLength(stacks);
  const nodeStack = stacks[1];
  expect(nodeStack.displayText).to.equal('Node');
  expect(nodeStack.value).to.equal('node');
  expect(nodeStack.preferredOs).to.equal('linux');
  expect(nodeStack.majorVersions.length).to.equal(8);
  expect(nodeStack).to.deep.equal(hardCodedNodeStack);
}

export function validatePythonStack(stacks) {
  validateAllStackLength(stacks);
  const pythonStack = stacks[2];
  expect(pythonStack.displayText).to.equal('Python');
  expect(pythonStack.value).to.equal('python');
  expect(pythonStack.preferredOs).to.equal('linux');
  expect(pythonStack.majorVersions.length).to.equal(2);
  expect(pythonStack).to.deep.equal(hardCodedPythonStack);
}

export function validatePHPStack(stacks) {
  validateAllStackLength(stacks);
  const phpStack = stacks[3];
  expect(phpStack.displayText).to.equal('PHP');
  expect(phpStack.value).to.equal('php');
  expect(phpStack.preferredOs).to.equal('linux');
  expect(phpStack.majorVersions.length).to.equal(2);
  expect(phpStack).to.deep.equal(hardCodedPhpStack);
}

export function validateDotnetCoreStack(stacks) {
  validateAllStackLength(stacks);
  const dotnetCoreStack = stacks[4];
  expect(dotnetCoreStack.displayText).to.equal('.NET Core');
  expect(dotnetCoreStack.value).to.equal('dotnetcore');
  expect(dotnetCoreStack.preferredOs).to.equal('windows');
  expect(dotnetCoreStack.majorVersions.length).to.equal(3);
  expect(dotnetCoreStack).to.deep.equal(hardCodedDotnetCoreStack);
}

export function validateRubyStack(stacks) {
  validateAllStackLength(stacks);
  const rubyStack = stacks[5];
  expect(rubyStack.displayText).to.equal('Ruby');
  expect(rubyStack.value).to.equal('ruby');
  expect(rubyStack.preferredOs).to.equal('linux');
  expect(rubyStack.majorVersions.length).to.equal(1);
  expect(rubyStack).to.deep.equal(hardCodedRubyStack);
}

export function validateJavaStack(stacks) {
  validateAllStackLength(stacks);
  const javaStack = stacks[6];
  expect(javaStack.displayText).to.equal('Java');
  expect(javaStack.value).to.equal('java');
  expect(javaStack.preferredOs).to.equal('linux');
  expect(javaStack.majorVersions.length).to.equal(3);
  expect(javaStack).to.deep.equal(hardCodedJavaStack);
}

export function validateJavaContainersStack(stacks) {
  validateAllStackLength(stacks);
  const javaContainersStack = stacks[7];
  expect(javaContainersStack.displayText).to.equal('Java Containers');
  expect(javaContainersStack.value).to.equal('javacontainers');
  expect(javaContainersStack.preferredOs).to.equal(undefined);
  expect(javaContainersStack.majorVersions.length).to.equal(9);
  expect(javaContainersStack).to.deep.equal(hardCodedJavaContainersStack);
}
