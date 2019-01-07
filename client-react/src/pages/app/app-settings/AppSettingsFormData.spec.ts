import {
  convertStateToForm,
  getFormAppSetting,
  getFormConnectionStrings,
  flattenVirtualApplicationsList,
  unFlattenVirtualApplicationsList,
  getCurrentStackString,
  convertFormToState,
} from './AppSettingsFormData';
import { mockSite, mockWebConfig, mockConnectionStrings, mockMetadata, mockAppSettings, mockSlotConfigName } from '../../../mocks/ArmMocks';
import { VirtualApplication } from '../../../models/WebAppModels';

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
    const mockAppSettingsForm = getFormAppSetting(mockProps.appSettings.data, mockProps.slotConfigNames.data);
    expect(mockAppSettingsForm.length).toBe(2);
    expect(mockAppSettingsForm.filter(x => x.sticky).length).toBe(1);
  });
});

describe('Get Arm App Setting Objects', () => {
  it('Converts app settings to app settings with slot config tick', () => {
    const mockFormData = convertStateToForm(mockProps as any);
    const newObjs = convertFormToState(mockFormData, mockProps.metadata.data, mockProps.slotConfigNames.data);
    expect(newObjs).toMatchSnapshot();
  });
});

describe('Get Form Connection Strings', () => {
  it('Converts connection strings to connection strings with slot config tick', () => {
    const mockConnectionStringsForm = getFormConnectionStrings(mockProps.connectionStrings.data, mockProps.slotConfigNames.data);
    expect(mockConnectionStringsForm.length).toBe(1);
    expect(mockConnectionStringsForm.filter(x => x.sticky).length).toBe(1);
  });
});

describe('Flatten Virtual Applications List', () => {
  it('converts API virtual application list to form virtual application list', () => {
    const mockVirtualApplicationForm = flattenVirtualApplicationsList(mockProps.config.data.properties
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
    const mockVirtualApplicationForm = flattenVirtualApplicationsList(mockProps.config.data.properties
      .virtualApplications as VirtualApplication[]);
    const mockVirtualApplicationApi = unFlattenVirtualApplicationsList(mockVirtualApplicationForm);
    expect(mockVirtualApplicationApi.length).toBe(2);
    expect(mockVirtualApplicationApi[0].virtualDirectories!.length).toBe(1);
  });
});

describe('Get Current Stack', () => {
  it('returns java if java version is there', () => {
    const configData = { ...mockProps.config.data } as any;
    const metadata = { ...mockProps.metadata.data };
    configData.properties.javaVersion = '1.8';
    const currentStack = getCurrentStackString(configData, metadata);
    expect(currentStack).toBe('java');
  });

  it('returns .net as default is nothing else is there', () => {
    const configData = { ...mockProps.config.data } as any;
    const metadata = { ...mockProps.metadata.data };
    configData.properties.javaVersion = null;
    const currentStack = getCurrentStackString(configData, metadata);
    expect(currentStack).toBe('dotnet');
  });

  it('returns what is stored in metadata absent a java version', () => {
    const configData = { ...mockProps.config.data } as any;
    const metadata = { ...mockProps.metadata.data };
    configData.properties.javaVersion = null;
    metadata.properties['CURRENT_STACK'] = 'python';
    const currentStack = getCurrentStackString(configData, metadata);
    expect(currentStack).toBe('python');
  });

  it('java version takes precidense over metadata', () => {
    const configData = { ...mockProps.config.data } as any;
    const metadata = { ...mockProps.metadata.data };
    configData.properties.javaVersion = '1.8';
    metadata.properties['CURRENT_STACK'] = 'python';
    const currentStack = getCurrentStackString(configData, metadata);
    expect(currentStack).toBe('java');
  });
});

const mockProps = {
  site: { data: mockSite },
  config: { data: mockWebConfig },
  appSettings: { data: mockAppSettings },
  connectionStrings: { data: mockConnectionStrings },
  metadata: { data: mockMetadata },
  siteWritePermission: true,
  slotConfigNames: { data: mockSlotConfigName },
};
