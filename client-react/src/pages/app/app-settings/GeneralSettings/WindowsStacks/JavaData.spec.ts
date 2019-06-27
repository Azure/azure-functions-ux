import {
  getJavaStack,
  getJavaContainers,
  getJavaMajorVersion,
  getJavaVersionAsDropdownOptions,
  getJavaMajorVersionObject,
  getJavaMinorVersionOptions,
  getJavaContainersOptions,
  getFrameworkVersionOptions,
} from './JavaData';
import { mockAvailableStacks } from '../../../../../mocks/ArmMocks';
import { AvailableStack } from '../../../../../models/available-stacks';
import { ArmArray } from '../../../../../models/arm-obj';

describe('getJavaStack', () => {
  let availableStacks: ArmArray<AvailableStack>;
  beforeEach(() => {
    availableStacks = { ...mockAvailableStacks } as ArmArray<AvailableStack>;
  });

  it('gets java stack from available stack', () => {
    const javaStack = getJavaStack(availableStacks.value);
    expect(javaStack).toEqual(availableStacks.value[4]);
  });
  it('returns falsy if there is no available stack', () => {
    const noJavaAvailable = availableStacks.value.filter(x => x.name !== 'java');
    const javaStack = getJavaStack(noJavaAvailable);
    expect(javaStack).toBeFalsy();
  });
});

describe('getJavaContainers', () => {
  let availableStacks: ArmArray<AvailableStack>;
  beforeEach(() => {
    availableStacks = { ...mockAvailableStacks } as ArmArray<AvailableStack>;
  });

  it('gets java stack from available stack', () => {
    const javaStack = getJavaContainers(availableStacks.value);
    expect(javaStack).toEqual(availableStacks.value[5]);
  });

  it('returns falsy if there is no available stack', () => {
    const noJavaContainersAvailable = availableStacks.value.filter(x => x.name !== 'javaContainers');
    const javaStack = getJavaContainers(noJavaContainersAvailable);
    expect(javaStack).toBeFalsy();
  });
});

describe('getJavaMajorVersion', () => {
  let javastack: ArmObj<AvailableStack>;
  beforeEach(() => {
    javastack = { ...mockAvailableStacks.value.find(x => x.name === 'java') } as ArmObj<AvailableStack>;
  });

  it('Should use version from config', () => {
    const config = { properties: { javaVersion: '1.7.0_51' } } as any;
    const javaMajorVersion = getJavaMajorVersion(javastack.properties, config);
    expect(javaMajorVersion).toBe('1.7');
  });

  it('Should use default version if not in config', () => {
    const config = { properties: { javaVersion: null } } as any;
    const javaMajorVersion = getJavaMajorVersion(javastack.properties, config);
    expect(javaMajorVersion).toBe('1.7');
  });

  it('Should default to 1.8 if there is no default in API', () => {
    const config = { properties: { javaVersion: null } } as any;
    javastack.properties.majorVersions[0].isDefault = false;
    const javaMajorVersion = getJavaMajorVersion(javastack.properties, config);
    expect(javaMajorVersion).toBe('1.8');
  });
});

describe('getJavaVersionAsDropdownOptions', () => {
  let javastack: ArmObj<AvailableStack>;
  beforeEach(() => {
    javastack = { ...mockAvailableStacks.value.find(x => x.name === 'java') } as ArmObj<AvailableStack>;
  });

  it('should map stack data to dropdown', () => {
    const javaVersionOptions = getJavaVersionAsDropdownOptions(javastack);
    javaVersionOptions.forEach(x => {
      expect(x.key).toBeTruthy();
      expect(x.text).toBeTruthy();
    });
    expect(javaVersionOptions.length).toBe(2);
  });

  it('should semantic java version to market version', () => {
    const javaVersionOptions = getJavaVersionAsDropdownOptions(javastack);
    javaVersionOptions.forEach(x => {
      const key = x.key as string;
      const text = x.text.replace('Java ', '');
      expect(`1.${text}`).toBe(key);
    });
  });
});

describe('getJavaMajorVersionObject', () => {
  let javastack: ArmObj<AvailableStack>;
  beforeEach(() => {
    javastack = { ...mockAvailableStacks.value.find(x => x.name === 'java') } as ArmObj<AvailableStack>;
  });

  it('should return object for major version', () => {
    const javaVersionObject = getJavaMajorVersionObject(javastack, '1.7');
    expect(javaVersionObject).toEqual(javastack.properties.majorVersions[0]);
  });
});

describe('getJavaMinorVersionOptions', () => {
  let javastack: ArmObj<AvailableStack>;
  beforeEach(() => {
    javastack = { ...mockAvailableStacks.value.find(x => x.name === 'java') } as ArmObj<AvailableStack>;
  });

  it('Should return options if java major version is selected', () => {
    const javaMinorVersionOptions = getJavaMinorVersionOptions('1.7', javastack, 'newest', 'autoupdate');
    expect(javaMinorVersionOptions.length).toBe(4);
  });
  it('Should return empty array if no major version', () => {
    const javaMinorVersionOptions = getJavaMinorVersionOptions('', javastack, 'newest', 'autoupdate');
    expect(javaMinorVersionOptions.length).toBe(0);
  });
});

describe('getJavaContainersOptions', () => {
  let javaContainersStack: ArmObj<AvailableStack>;
  beforeEach(() => {
    javaContainersStack = { ...mockAvailableStacks.value.find(x => x.name === 'javaContainers') } as ArmObj<AvailableStack>;
  });

  it('expect all containers to show', () => {
    const javaContainers = getJavaContainersOptions(javaContainersStack);
    expect(javaContainers.length).toBe(2);
  });
});

describe('getFrameworkVersionOptions', () => {
  let javaContainersStack: ArmObj<AvailableStack>;
  const latest = 'latest';
  beforeEach(() => {
    javaContainersStack = { ...mockAvailableStacks.value.find(x => x.name === 'javaContainers') } as ArmObj<AvailableStack>;
  });

  it('returns list of versions if container is present', () => {
    const config = { properties: { javaContainer: 'TOMCAT' } } as any;
    const minorVersions = getFrameworkVersionOptions(javaContainersStack, config, latest);
    expect(minorVersions.length).toBe(14);
  });

  it('returns empty list if container is not present', () => {
    const config = { properties: { javaContainer: '' } } as any;
    const minorVersions = getFrameworkVersionOptions(javaContainersStack, config, latest);
    expect(minorVersions.length).toBe(0);
  });
});
