import * as chai from 'chai';
import { dotnetStack as hardCodedDotnetStack } from './../../../../stacks/2020-10-01/stacks/web-app-stacks/Dotnet';
import { nodeStack as hardCodedNodeStack } from './../../../../stacks/2020-10-01/stacks/web-app-stacks/Node';
import { pythonStack as hardCodedPythonStack } from './../../../../stacks/2020-10-01/stacks/web-app-stacks/Python';
import { phpStack as hardCodedPhpStack } from './../../../../stacks/2020-10-01/stacks/web-app-stacks/Php';
import { rubyStack as hardCodedRubyStack } from './../../../../stacks/2020-10-01/stacks/web-app-stacks/Ruby';
import { javaStack as hardCodedJavaStack } from './../../../../stacks/2020-10-01/stacks/web-app-stacks/Java';
import { javaContainersStack as hardCodedJavaContainersStack } from './../../../../stacks/2020-10-01/stacks/web-app-stacks/JavaContainers';

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
  expect(stacks.length).to.equal(8);
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

export function validateNotHiddenStacks(stacks) {
  validateNotHiddenStacksLength(stacks);
  validateStacksAreNotHidden(stacks);
}

function validateNotHiddenStacksLength(stacks) {
  expect(stacks).to.be.an('array');
  expect(stacks.length).to.equal(8);
}

function validateStacksAreNotHidden(stacks) {
  stacks.forEach(stack => {
    expect(stack.majorVersions).to.be.an('array');
    stack.majorVersions.forEach(majorVersion => {
      expect(majorVersion.minorVersions).to.be.an('array');
      majorVersion.minorVersions.forEach(minorVersion => {
        if (minorVersion.stackSettings.windowsRuntimeSettings) {
          expect(minorVersion.stackSettings.windowsRuntimeSettings).to.not.have.property('isHidden', true);
        }
        if (minorVersion.stackSettings.linuxRuntimeSettings) {
          expect(minorVersion.stackSettings.linuxRuntimeSettings).to.not.have.property('isHidden', true);
        }
        if (minorVersion.stackSettings.windowsContainerSettings) {
          expect(minorVersion.stackSettings.windowsContainerSettings).to.not.have.property('isHidden', true);
        }
        if (minorVersion.stackSettings.linuxContainerSettings) {
          expect(minorVersion.stackSettings.linuxContainerSettings).to.not.have.property('isHidden', true);
        }
      });
    });
  });
}

export function validateNotDeprecatedStacks(stacks) {
  validateNotDeprecatedStacksLength(stacks);
  validateStacksAreNotDeprecated(stacks);
}

function validateNotDeprecatedStacksLength(stacks) {
  expect(stacks).to.be.an('array');
  expect(stacks.length).to.equal(8);
}

function validateStacksAreNotDeprecated(stacks) {
  stacks.forEach(stack => {
    expect(stack.majorVersions).to.be.an('array');
    stack.majorVersions.forEach(majorVersion => {
      expect(majorVersion.minorVersions).to.be.an('array');
      majorVersion.minorVersions.forEach(minorVersion => {
        if (minorVersion.stackSettings.windowsRuntimeSettings) {
          expect(minorVersion.stackSettings.windowsRuntimeSettings).to.not.have.property('isDeprecated', true);
        }
        if (minorVersion.stackSettings.linuxRuntimeSettings) {
          expect(minorVersion.stackSettings.linuxRuntimeSettings).to.not.have.property('isDeprecated', true);
        }
        if (minorVersion.stackSettings.windowsContainerSettings) {
          expect(minorVersion.stackSettings.windowsContainerSettings).to.not.have.property('isDeprecated', true);
        }
        if (minorVersion.stackSettings.linuxContainerSettings) {
          expect(minorVersion.stackSettings.linuxContainerSettings).to.not.have.property('isDeprecated', true);
        }
      });
    });
  });
}

export function validateNotPreviewStacks(stacks) {
  validateNotPreviewStacksLength(stacks);
  validateStacksAreNotPreview(stacks);
}

function validateNotPreviewStacksLength(stacks) {
  expect(stacks).to.be.an('array');
  expect(stacks.length).to.equal(8);
}

function validateStacksAreNotPreview(stacks) {
  stacks.forEach(stack => {
    expect(stack.majorVersions).to.be.an('array');
    stack.majorVersions.forEach(majorVersion => {
      expect(majorVersion.minorVersions).to.be.an('array');
      majorVersion.minorVersions.forEach(minorVersion => {
        if (minorVersion.stackSettings.windowsRuntimeSettings) {
          expect(minorVersion.stackSettings.windowsRuntimeSettings).to.not.have.property('isPreview', true);
        }
        if (minorVersion.stackSettings.linuxRuntimeSettings) {
          expect(minorVersion.stackSettings.linuxRuntimeSettings).to.not.have.property('isPreview', true);
        }
        if (minorVersion.stackSettings.windowsContainerSettings) {
          expect(minorVersion.stackSettings.windowsContainerSettings).to.not.have.property('isPreview', true);
        }
        if (minorVersion.stackSettings.linuxContainerSettings) {
          expect(minorVersion.stackSettings.linuxContainerSettings).to.not.have.property('isPreview', true);
        }
      });
    });
  });
}

function validateFilterStackLength(stacks) {
  expect(stacks).to.be.an('array');
  expect(stacks.length).to.equal(1);
}

export function validateDotnetInStacks(stacks) {
  validateAllStackLength(stacks);
  validateDotnetStack(stacks[0]);
}

export function validateDotnetFilter(stacks) {
  validateFilterStackLength(stacks);
  validateDotnetStack(stacks[0]);
}

function validateDotnetStack(dotnetStack) {
  expect(dotnetStack.displayText).to.equal('.NET');
  expect(dotnetStack.value).to.equal('dotnet');
  expect(dotnetStack.preferredOs).to.equal('windows');
  expect(dotnetStack.majorVersions.length).to.equal(3);
  expect(dotnetStack).to.deep.equal(hardCodedDotnetStack);
}

export function validateNodeInStacks(stacks) {
  validateAllStackLength(stacks);
  validateNodeStack(stacks[1]);
}

export function validateNodeFilter(stacks) {
  validateFilterStackLength(stacks);
  validateNodeStack(stacks[0]);
}

function validateNodeStack(nodeStack) {
  expect(nodeStack.displayText).to.equal('Node');
  expect(nodeStack.value).to.equal('node');
  expect(nodeStack.preferredOs).to.equal('linux');
  expect(nodeStack.majorVersions.length).to.equal(9);
  expect(nodeStack).to.deep.equal(hardCodedNodeStack);
}

export function validatePythonInStacks(stacks) {
  validateAllStackLength(stacks);
  validatePythonStack(stacks[2]);
}

export function validatePythonFilter(stacks) {
  validateFilterStackLength(stacks);
  validatePythonStack(stacks[0]);
}

function validatePythonStack(pythonStack) {
  expect(pythonStack.displayText).to.equal('Python');
  expect(pythonStack.value).to.equal('python');
  expect(pythonStack.preferredOs).to.equal('linux');
  expect(pythonStack.majorVersions.length).to.equal(2);
  expect(pythonStack).to.deep.equal(hardCodedPythonStack);
}

export function validatePHPInStacks(stacks) {
  validateAllStackLength(stacks);
  validatePHPStack(stacks[3]);
}

export function validatePHPFilter(stacks) {
  validateFilterStackLength(stacks);
  validatePHPStack(stacks[0]);
}

function validatePHPStack(phpStack) {
  expect(phpStack.displayText).to.equal('PHP');
  expect(phpStack.value).to.equal('php');
  expect(phpStack.preferredOs).to.equal('linux');
  expect(phpStack.majorVersions.length).to.equal(2);
  expect(phpStack).to.deep.equal(hardCodedPhpStack);
}

export function validateRubyInStacks(stacks) {
  validateAllStackLength(stacks);
  validateRubyStack(stacks[5]);
}

export function validateRubyFilter(stacks) {
  validateFilterStackLength(stacks);
  validateRubyStack(stacks[0]);
}

function validateRubyStack(rubyStack) {
  expect(rubyStack.displayText).to.equal('Ruby');
  expect(rubyStack.value).to.equal('ruby');
  expect(rubyStack.preferredOs).to.equal('linux');
  expect(rubyStack.majorVersions.length).to.equal(1);
  expect(rubyStack).to.deep.equal(hardCodedRubyStack);
}

export function validateJavaInStacks(stacks) {
  validateAllStackLength(stacks);
  validateJavaStack(stacks[6]);
}

export function validateJavaFilter(stacks) {
  validateFilterStackLength(stacks);
  validateJavaStack(stacks[0]);
}

function validateJavaStack(javaStack) {
  expect(javaStack.displayText).to.equal('Java');
  expect(javaStack.value).to.equal('java');
  expect(javaStack.preferredOs).to.equal('linux');
  expect(javaStack.majorVersions.length).to.equal(3);
  expect(javaStack).to.deep.equal(hardCodedJavaStack);
}

export function validateJavaContainersInStacks(stacks) {
  validateAllStackLength(stacks);
  validateJavaContainersStack(stacks[7]);
}

export function validateJavaContainersFilter(stacks) {
  validateFilterStackLength(stacks);
  validateJavaContainersStack(stacks[0]);
}

function validateJavaContainersStack(javaContainersStack) {
  expect(javaContainersStack.displayText).to.equal('Java Containers');
  expect(javaContainersStack.value).to.equal('javacontainers');
  expect(javaContainersStack.preferredOs).to.equal(undefined);
  expect(javaContainersStack.majorVersions.length).to.equal(9);
  expect(javaContainersStack).to.deep.equal(hardCodedJavaContainersStack);
}
