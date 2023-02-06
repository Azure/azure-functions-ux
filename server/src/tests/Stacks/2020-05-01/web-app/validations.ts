import * as chai from 'chai';
import { aspDotnetCreateStack } from './../../../../stacks/2020-05-01/stacks/web-app-stacks/create/AspDotnet';
import { nodeCreateStack } from './../../../../stacks/2020-05-01/stacks/web-app-stacks/create/Node';
import { pythonCreateStack } from './../../../../stacks/2020-05-01/stacks/web-app-stacks/create/Python';
import { phpCreateStack } from './../../../../stacks/2020-05-01/stacks/web-app-stacks/create/Php';
import { dotnetCoreCreateStack } from './../../../../stacks/2020-05-01/stacks/web-app-stacks/create/DotnetCore';
import { rubyCreateStack } from './../../../../stacks/2020-05-01/stacks/web-app-stacks/create/Ruby';
import { java8CreateStack } from './../../../../stacks/2020-05-01/stacks/web-app-stacks/create/Java8';
import { java11CreateStack } from './../../../../stacks/2020-05-01/stacks/web-app-stacks/create/Java11';

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
  expect(stacks.length).to.equal(6);
}

export function validateConfigLinuxStackLength(stacks) {
  expect(stacks).to.be.an('array');
  expect(stacks.length).to.equal(6);
}

export function validateGithubActionStackLength(stacks) {
  expect(stacks).to.be.an('array');
  expect(stacks.length).to.equal(6);
}

export function validateGithubActionWindowsStackLength(stacks) {
  expect(stacks).to.be.an('array');
  expect(stacks.length).to.equal(7);
}

export function validateGithubActionLinuxStackLength(stacks) {
  expect(stacks).to.be.an('array');
  expect(stacks.length).to.equal(6);
}

export function validateASPCreateStack(stacks) {
  validateCreateStackLength(stacks);
  const aspStack = stacks[0];
  expect(aspStack.displayText).to.equal('.NET');
  expect(aspStack.value).to.equal('ASP.NET');
  expect(aspStack.sortOrder).to.equal(0);
  expect(aspStack.versions.length).to.equal(3);
  expect(aspStack).to.deep.equal(aspDotnetCreateStack);
}

export function validateNodeCreateStack(stacks) {
  validateCreateStackLength(stacks);
  const nodeStack = stacks[1];
  expect(nodeStack.displayText).to.equal('Node');
  expect(nodeStack.value).to.equal('Node');
  expect(nodeStack.sortOrder).to.equal(1);
  expect(nodeStack.versions.length).to.equal(8);
  expect(nodeStack).to.deep.equal(nodeCreateStack);
}

export function validatePythonCreateStack(stacks) {
  validateCreateStackLength(stacks);
  const pythonStack = stacks[2];
  expect(pythonStack.displayText).to.equal('Python');
  expect(pythonStack.value).to.equal('Python');
  expect(pythonStack.sortOrder).to.equal(2);
  expect(pythonStack.versions.length).to.equal(4);
  expect(pythonStack).to.deep.equal(pythonCreateStack);
}

export function validatePHPCreateStack(stacks) {
  validateCreateStackLength(stacks);
  const phpStack = stacks[3];
  expect(phpStack.displayText).to.equal('PHP');
  expect(phpStack.value).to.equal('PHP');
  expect(phpStack.sortOrder).to.equal(3);
  expect(phpStack.versions.length).to.equal(4);
  expect(phpStack).to.deep.equal(phpCreateStack);
}

export function validateDotnetCoreCreateStack(stacks) {
  validateCreateStackLength(stacks);
  const dotnetCoreStack = stacks[4];
  expect(dotnetCoreStack.displayText).to.equal('.NET Core');
  expect(dotnetCoreStack.value).to.equal('DOTNETCORE');
  expect(dotnetCoreStack.sortOrder).to.equal(4);
  expect(dotnetCoreStack.versions.length).to.equal(2);
  expect(dotnetCoreStack).to.deep.equal(dotnetCoreCreateStack);
}

export function validateRubyCreateStack(stacks) {
  validateCreateStackLength(stacks);
  const rubyStack = stacks[5];
  expect(rubyStack.displayText).to.equal('Ruby');
  expect(rubyStack.value).to.equal('Ruby');
  expect(rubyStack.sortOrder).to.equal(5);
  expect(rubyStack.versions.length).to.equal(2);
  expect(rubyStack).to.deep.equal(rubyCreateStack);
}

export function validateJava8CreateStack(stacks) {
  validateCreateStackLength(stacks);
  const javaStack = stacks[6];
  expect(javaStack.displayText).to.equal('Java 8');
  expect(javaStack.value).to.equal('Java-8');
  expect(javaStack.sortOrder).to.equal(6);
  expect(javaStack.versions.length).to.equal(4);
  expect(javaStack).to.deep.equal(java8CreateStack);
}

export function validateJava11CreateStack(stacks) {
  validateCreateStackLength(stacks);
  const javaStack = stacks[7];
  expect(javaStack.displayText).to.equal('Java 11');
  expect(javaStack.value).to.equal('Java-11');
  expect(javaStack.sortOrder).to.equal(7);
  expect(javaStack.versions.length).to.equal(3);
  expect(javaStack).to.deep.equal(java11CreateStack);
}
