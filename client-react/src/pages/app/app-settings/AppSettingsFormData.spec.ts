import {
  convertStateToForm,
  getFormAppSetting,
  getFormConnectionStrings,
  flattenVirtualApplicationsList,
  unFlattenVirtualApplicationsList,
  getCurrentStackString,
  convertFormToState,
  getConfigWithStackSettings,
} from './AppSettingsFormData';
import { mockSite, mockWebConfig, mockConnectionStrings, mockMetadata, mockAppSettings, mockSlotConfigName } from '../../../mocks/ArmMocks';
import { VirtualApplication } from '../../../models/site/config';

describe('Convert State to Form Data', () => {
  it('convert redux state to form state', () => {
    const mockFormData = convertStateToForm(mockProps as any);
    expect(mockFormData.virtualApplications.length).toBe(3);
    expect(mockFormData.appSettings.length).toBe(2);
    expect(mockFormData.connectionStrings.length).toBe(1);
    expect(mockFormData.currentlySelectedStack).toBeTruthy();
  });
});

describe('Get Form App Setting', () => {
  it('Converts app settings to app settings with slot config tick', () => {
    const mockAppSettingsForm = getFormAppSetting(mockProps.appSettings, mockProps.slotConfigNames);
    expect(mockAppSettingsForm.length).toBe(2);
    expect(mockAppSettingsForm.filter(x => x.sticky).length).toBe(1);
  });
});

describe('Get Arm App Setting Objects', () => {
  it('Converts app settings to app settings with slot config tick', () => {
    const mockFormData = convertStateToForm(mockProps as any);
    const newObjs = convertFormToState(mockFormData, mockProps.metadata, mockProps.slotConfigNames);
    expect(newObjs).toMatchSnapshot();
  });
});

describe('Get Form Connection Strings', () => {
  it('Converts connection strings to connection strings with slot config tick', () => {
    const mockConnectionStringsForm = getFormConnectionStrings(mockProps.connectionStrings, mockProps.slotConfigNames);
    expect(mockConnectionStringsForm.length).toBe(1);
    expect(mockConnectionStringsForm.filter(x => x.sticky).length).toBe(1);
  });
});

describe('Flatten Virtual Applications List', () => {
  it('converts API virtual application list to form virtual application list', () => {
    const mockVirtualApplicationForm = flattenVirtualApplicationsList(mockProps.config.properties
      .virtualApplications as VirtualApplication[]);
    expect(mockVirtualApplicationForm.length).toBe(3);
    expect(mockVirtualApplicationForm.filter(x => x.virtualDirectory).length).toBe(1);
    expect(mockVirtualApplicationForm.filter(x => !x.virtualDirectory).length).toBe(2);
  });

  it('null api value returns empty array', () => {
    const mockVirtualApplicationForm = flattenVirtualApplicationsList(null);
    expect(mockVirtualApplicationForm.length).toBe(0);
  });
});

describe('Unflatten Virtual Applications List', () => {
  it('converts Form virtual application list back to api virtual application list', () => {
    const mockVirtualApplicationForm = flattenVirtualApplicationsList(mockProps.config.properties
      .virtualApplications as VirtualApplication[]);
    const mockVirtualApplicationApi = unFlattenVirtualApplicationsList(mockVirtualApplicationForm);
    expect(mockVirtualApplicationApi.length).toBe(2);
    expect(mockVirtualApplicationApi[0].virtualDirectories!.length).toBe(1);
  });

  it("Handles virtual paths that don't start with /", () => {
    const virtualApplicationsFormData = [
      {
        virtualPath: '/',
        physicalPath: 'site\\wwwroot',
        preloadEnabled: true,
        virtualDirectory: false,
      },
      {
        virtualPath: '/testapp',
        physicalPath: 'site\\testapp',
        preloadEnabled: false,
        virtualDirectory: false,
        virtualDirectories: [],
      },
      {
        virtualPath: 'test2',
        physicalPath: 'site\\wwwroot\\dir',
        virtualDirectory: true,
      },
    ];
    const expectedVirtualApplicationsApiData = [
      { physicalPath: 'site\\testapp', preloadEnabled: false, virtualDirectories: [], virtualDirectory: false, virtualPath: '/testapp' },
      {
        physicalPath: 'site\\wwwroot',
        preloadEnabled: true,
        virtualDirectories: [{ physicalPath: 'site\\wwwroot\\dir', virtualDirectory: true, virtualPath: 'test2' }],
        virtualDirectory: false,
        virtualPath: '/',
      },
    ];
    const unflattenedData = unFlattenVirtualApplicationsList(virtualApplicationsFormData);
    expect(unflattenedData).toEqual(expectedVirtualApplicationsApiData);
  });

  it('Handles virtual paths that does start with /', () => {
    const virtualApplicationsFormData = [
      {
        virtualPath: '/',
        physicalPath: 'site\\wwwroot',
        preloadEnabled: true,
        virtualDirectory: false,
      },
      {
        virtualPath: '/testapp',
        physicalPath: 'site\\testapp',
        preloadEnabled: false,
        virtualDirectory: false,
        virtualDirectories: [],
      },
      {
        virtualPath: '/test2',
        physicalPath: 'site\\wwwroot\\dir',
        virtualDirectory: true,
      },
    ];
    const expectedVirtualApplicationsApiData = [
      { physicalPath: 'site\\testapp', preloadEnabled: false, virtualDirectories: [], virtualDirectory: false, virtualPath: '/testapp' },
      {
        physicalPath: 'site\\wwwroot',
        preloadEnabled: true,
        virtualDirectories: [{ physicalPath: 'site\\wwwroot\\dir', virtualDirectory: true, virtualPath: 'test2' }],
        virtualDirectory: false,
        virtualPath: '/',
      },
    ];
    const unflattenedData = unFlattenVirtualApplicationsList(virtualApplicationsFormData);
    expect(unflattenedData).toEqual(expectedVirtualApplicationsApiData);
  });

  it('Handles virtual paths that has mixed / usage', () => {
    const virtualApplicationsFormData = [
      {
        virtualPath: '/',
        physicalPath: 'site\\wwwroot',
        preloadEnabled: true,
        virtualDirectory: false,
      },
      {
        virtualPath: '/testapp',
        physicalPath: 'site\\testapp',
        preloadEnabled: false,
        virtualDirectory: false,
        virtualDirectories: [],
      },
      {
        virtualPath: '/test2',
        physicalPath: 'site\\wwwroot\\dir',
        virtualDirectory: true,
      },
      {
        virtualPath: 'test3',
        physicalPath: 'site\\wwwroot\\dir',
        virtualDirectory: true,
      },
    ];
    const expectedVirtualApplicationsApiData = [
      { physicalPath: 'site\\testapp', preloadEnabled: false, virtualDirectories: [], virtualDirectory: false, virtualPath: '/testapp' },
      {
        physicalPath: 'site\\wwwroot',
        preloadEnabled: true,
        virtualDirectories: [
          { physicalPath: 'site\\wwwroot\\dir', virtualDirectory: true, virtualPath: 'test2' },
          { physicalPath: 'site\\wwwroot\\dir', virtualDirectory: true, virtualPath: 'test3' },
        ],
        virtualDirectory: false,
        virtualPath: '/',
      },
    ];
    const unflattenedData = unFlattenVirtualApplicationsList(virtualApplicationsFormData);
    expect(unflattenedData).toEqual(expectedVirtualApplicationsApiData);
  });
});

describe('Get Current Stack', () => {
  it('returns java if java version is there', () => {
    const configData = { ...mockProps.config } as any;
    const metadata = { ...mockProps.metadata };
    configData.properties.javaVersion = '1.8';
    const currentStack = getCurrentStackString(configData, metadata);
    expect(currentStack).toBe('java');
  });

  it('returns .net as default is nothing else is there', () => {
    const configData = { ...mockProps.config } as any;
    const metadata = { ...mockProps.metadata };
    configData.properties.javaVersion = null;
    const currentStack = getCurrentStackString(configData, metadata);
    expect(currentStack).toBe('dotnet');
  });

  it('returns what is stored in metadata absent a java version', () => {
    const configData = { ...mockProps.config } as any;
    const metadata = { ...mockProps.metadata };
    configData.properties.javaVersion = null;
    metadata.properties['CURRENT_STACK'] = 'python';
    const currentStack = getCurrentStackString(configData, metadata);
    expect(currentStack).toBe('python');
  });

  it('java version takes precidense over metadata', () => {
    const configData = { ...mockProps.config } as any;
    const metadata = { ...mockProps.metadata };
    configData.properties.javaVersion = '1.8';
    metadata.properties['CURRENT_STACK'] = 'python';
    const currentStack = getCurrentStackString(configData, metadata);
    expect(currentStack).toBe('java');
  });
});

describe('getConfigWithStackSettings', () => {
  it("removes java settings if currentlySelectedStack isn't java", () => {
    const configData = {
      ...mockProps.config,
      properties: {
        javaContainer: 'test',
        javaContainerVersion: 'test',
        javaVersion: 'test',
      },
    } as any;
    const values = { currentlySelectedStack: 'notjava' } as any;
    const configBack = getConfigWithStackSettings(configData, values);
    expect(configBack.properties.javaContainer).toBe('');
    expect(configBack.properties.javaContainerVersion).toBe('');
    expect(configBack.properties.javaVersion).toBe('');
  });
  it('leaves java settings if currently selected stack is java', () => {
    const configData = {
      ...mockProps.config,
      properties: {
        javaContainer: 'test',
        javaContainerVersion: 'test',
        javaVersion: 'test',
      },
    } as any;
    const values = { currentlySelectedStack: 'java' } as any;
    const configBack = getConfigWithStackSettings(configData, values);
    expect(configBack.properties.javaContainer).toBe('test');
    expect(configBack.properties.javaContainerVersion).toBe('test');
    expect(configBack.properties.javaVersion).toBe('test');
  });
});

const mockProps = {
  site: mockSite,
  config: mockWebConfig,
  appSettings: mockAppSettings,
  connectionStrings: mockConnectionStrings,
  metadata: mockMetadata,
  slotConfigNames: mockSlotConfigName,
};
