import * as chai from 'chai';
const expect = chai.expect;

export function validateCreateStackLength(stacks) {
  expect(stacks).to.be.an('array');
  expect(stacks.length).to.equal(8);
}

export function validateConfigStackLength(stacks) {
  expect(stacks).to.be.an('array');
  expect(stacks.length).to.equal(14);
}

export function validateConfigWindowsStackLength(stacks) {
  expect(stacks).to.be.an('array');
  expect(stacks.length).to.equal(7);
}

export function validateConfigLinuxStackLength(stacks) {
  expect(stacks).to.be.an('array');
  expect(stacks.length).to.equal(7);
}

export function validateGithubActionStackLength(stacks) {
  expect(stacks).to.be.an('array');
  expect(stacks.length).to.equal(5);
}

export function validateGithubActionWindowsStackLength(stacks) {
  expect(stacks).to.be.an('array');
  expect(stacks.length).to.equal(5);
}

export function validateGithubActionLinuxStackLength(stacks) {
  expect(stacks).to.be.an('array');
  expect(stacks.length).to.equal(5);
}

export function validateASPCreateStack(stacks) {
  validateCreateStackLength(stacks);
  const aspStack = stacks[0];
  expect(aspStack.displayText).to.equal('ASP.NET');
  expect(aspStack.value).to.equal('ASP.NET');
  expect(aspStack.sortOrder).to.equal(0);
  expect(aspStack.versions.length).to.equal(2);
}

export function validateNodeCreateStack(stacks) {
  validateCreateStackLength(stacks);
  const nodeStack = stacks[1];
  expect(nodeStack.displayText).to.equal('Node');
  expect(nodeStack.value).to.equal('Node');
  expect(nodeStack.sortOrder).to.equal(1);
  expect(nodeStack.versions.length).to.equal(7);
}

export function validatePythonCreateStack(stacks) {
  validateCreateStackLength(stacks);
  const pythonStack = stacks[2];
  expect(pythonStack.displayText).to.equal('Python');
  expect(pythonStack.value).to.equal('Python');
  expect(pythonStack.sortOrder).to.equal(2);
  expect(pythonStack.versions.length).to.equal(3);
}

export function validatePHPCreateStack(stacks) {
  validateCreateStackLength(stacks);
  const phpStack = stacks[3];
  expect(phpStack.displayText).to.equal('PHP');
  expect(phpStack.value).to.equal('PHP');
  expect(phpStack.sortOrder).to.equal(3);
  expect(phpStack.versions.length).to.equal(2);
}

export function validateDotnetCoreCreateStack(stacks) {
  validateCreateStackLength(stacks);
  const dotnetCoreStack = stacks[4];
  expect(dotnetCoreStack.displayText).to.equal('.NET Core');
  expect(dotnetCoreStack.value).to.equal('DOTNETCORE');
  expect(dotnetCoreStack.sortOrder).to.equal(4);
  expect(dotnetCoreStack.versions.length).to.equal(2);
}

export function validateRubyCreateStack(stacks) {
  validateCreateStackLength(stacks);
  const rubyStack = stacks[5];
  expect(rubyStack.displayText).to.equal('Ruby');
  expect(rubyStack.value).to.equal('Ruby');
  expect(rubyStack.sortOrder).to.equal(5);
  expect(rubyStack.versions.length).to.equal(2);
}

export function validateJava8CreateStack(stacks) {
  validateCreateStackLength(stacks);
  const javaStack = stacks[6];
  expect(javaStack.displayText).to.equal('Java 8');
  expect(javaStack.value).to.equal('Java-8');
  expect(javaStack.sortOrder).to.equal(6);
  expect(javaStack.versions.length).to.equal(3);
}

export function validateJava11CreateStack(stacks) {
  validateCreateStackLength(stacks);
  const javaContainersStack = stacks[7];
  expect(javaContainersStack.displayText).to.equal('Java 11');
  expect(javaContainersStack.value).to.equal('Java-11');
  expect(javaContainersStack.sortOrder).to.equal(7);
  expect(javaContainersStack.versions.length).to.equal(3);
}

export function validateASPWindowsConfigStack(stacks) {
  validateConfigStackLength(stacks);
  const aspStack = stacks[0];
  expect(aspStack.name).to.equal('aspnet');
  expect(aspStack.type).to.equal('Microsoft.Web/availableStacks?osTypeSelected=Windows');
  expect(aspStack.properties.name).to.equal('aspnet');
  expect(aspStack.properties.display).to.equal('ASP.NET');
  expect(aspStack.properties.majorVersions.length).to.equal(2);
}

export function validateNodeWindowsConfigStack(stacks) {
  validateConfigStackLength(stacks);
  const nodeStack = stacks[1];
  expect(nodeStack.name).to.equal('node');
  expect(nodeStack.type).to.equal('Microsoft.Web/availableStacks?osTypeSelected=Windows');
  expect(nodeStack.properties.name).to.equal('node');
  expect(nodeStack.properties.display).to.equal('Node');
  expect(nodeStack.properties.majorVersions.length).to.equal(19);
}

export function validatePythonWindowsConfigStack(stacks) {
  validateConfigStackLength(stacks);
  const pythonStack = stacks[2];
  expect(pythonStack.name).to.equal('python');
  expect(pythonStack.type).to.equal('Microsoft.Web/availableStacks?osTypeSelected=Windows');
  expect(pythonStack.properties.name).to.equal('python');
  expect(pythonStack.properties.display).to.equal('Python');
  expect(pythonStack.properties.majorVersions.length).to.equal(2);
}

export function validatePHPWindowsConfigStack(stacks) {
  validateConfigStackLength(stacks);
  const phpStack = stacks[3];
  expect(phpStack.name).to.equal('php');
  expect(phpStack.type).to.equal('Microsoft.Web/availableStacks?osTypeSelected=Windows');
  expect(phpStack.properties.name).to.equal('php');
  expect(phpStack.properties.display).to.equal('PHP');
  expect(phpStack.properties.majorVersions.length).to.equal(6);
}

export function validateDotnetCoreWindowsConfigStack(stacks) {
  validateConfigStackLength(stacks);
  const dotnetCoreStack = stacks[4];
  expect(dotnetCoreStack.name).to.equal('dotnetcore');
  expect(dotnetCoreStack.type).to.equal('Microsoft.Web/availableStacks?osTypeSelected=Windows');
  expect(dotnetCoreStack.properties.name).to.equal('dotnetcore');
  expect(dotnetCoreStack.properties.display).to.equal('.NET Core');
  expect(dotnetCoreStack.properties.majorVersions.length).to.equal(5);
}

export function validateJavaWindowsConfigStack(stacks) {
  validateConfigStackLength(stacks);
  const javaStack = stacks[5];
  expect(javaStack.name).to.equal('java');
  expect(javaStack.type).to.equal('Microsoft.Web/availableStacks?osTypeSelected=Windows');
  expect(javaStack.properties.name).to.equal('java');
  expect(javaStack.properties.display).to.equal('Java');
  expect(javaStack.properties.majorVersions.length).to.equal(3);
}

export function validateJavaContainersWindowsConfigStack(stacks) {
  validateConfigStackLength(stacks);
  const javaContainersStack = stacks[6];
  expect(javaContainersStack.name).to.equal('javaContainers');
  expect(javaContainersStack.type).to.equal('Microsoft.Web/availableStacks?osTypeSelected=Windows');
  expect(javaContainersStack.properties.name).to.equal('javaContainers');
  expect(javaContainersStack.properties.display).to.equal('Java');
  expect(javaContainersStack.properties.dependency).to.equal('java');
  expect(javaContainersStack.properties.majorVersions.length).to.equal(0);
  expect(javaContainersStack.properties.frameworks.length).to.equal(3);
}

export function validateNodeLinuxConfigStack(stacks) {
  validateConfigStackLength(stacks);
  const nodeStack = stacks[7];
  expect(nodeStack.name).to.equal('node');
  expect(nodeStack.type).to.equal('Microsoft.Web/availableStacks?osTypeSelected=Linux');
  expect(nodeStack.properties.name).to.equal('node');
  expect(nodeStack.properties.display).to.equal('Node');
  expect(nodeStack.properties.majorVersions.length).to.equal(27);
}

export function validatePythonLinuxConfigStack(stacks) {
  validateConfigStackLength(stacks);
  const pythonStack = stacks[8];
  expect(pythonStack.name).to.equal('python');
  expect(pythonStack.type).to.equal('Microsoft.Web/availableStacks?osTypeSelected=Linux');
  expect(pythonStack.properties.name).to.equal('python');
  expect(pythonStack.properties.display).to.equal('Python');
  expect(pythonStack.properties.majorVersions.length).to.equal(4);
}

export function validatePHPLinuxConfigStack(stacks) {
  validateConfigStackLength(stacks);
  const phpStack = stacks[9];
  expect(phpStack.name).to.equal('php');
  expect(phpStack.type).to.equal('Microsoft.Web/availableStacks?osTypeSelected=Linux');
  expect(phpStack.properties.name).to.equal('php');
  expect(phpStack.properties.display).to.equal('PHP');
  expect(phpStack.properties.majorVersions.length).to.equal(4);
}

export function validateDotnetCoreLinuxConfigStack(stacks) {
  validateConfigStackLength(stacks);
  const dotnetCoreStack = stacks[10];
  expect(dotnetCoreStack.name).to.equal('dotnetcore');
  expect(dotnetCoreStack.type).to.equal('Microsoft.Web/availableStacks?osTypeSelected=Linux');
  expect(dotnetCoreStack.properties.name).to.equal('dotnetcore');
  expect(dotnetCoreStack.properties.display).to.equal('.NET Core');
  expect(dotnetCoreStack.properties.majorVersions.length).to.equal(8);
}

export function validateRubyLinuxConfigStack(stacks) {
  validateConfigStackLength(stacks);
  const rubyStack = stacks[11];
  expect(rubyStack.name).to.equal('ruby');
  expect(rubyStack.type).to.equal('Microsoft.Web/availableStacks?osTypeSelected=Linux');
  expect(rubyStack.properties.name).to.equal('ruby');
  expect(rubyStack.properties.display).to.equal('Ruby');
  expect(rubyStack.properties.majorVersions.length).to.equal(4);
}

export function validateJava8LinuxConfigStack(stacks) {
  validateConfigStackLength(stacks);
  const javaStack = stacks[12];
  expect(javaStack.name).to.equal('java8');
  expect(javaStack.type).to.equal('Microsoft.Web/availableStacks?osTypeSelected=Linux');
  expect(javaStack.properties.name).to.equal('java8');
  expect(javaStack.properties.display).to.equal('Java 8');
  expect(javaStack.properties.majorVersions.length).to.equal(4);
}

export function validateJava11LinuxConfigStack(stacks) {
  validateConfigStackLength(stacks);
  const javaStack = stacks[13];
  expect(javaStack.name).to.equal('java11');
  expect(javaStack.type).to.equal('Microsoft.Web/availableStacks?osTypeSelected=Linux');
  expect(javaStack.properties.name).to.equal('java11');
  expect(javaStack.properties.display).to.equal('Java 11');
  expect(javaStack.properties.majorVersions.length).to.equal(3);
}
