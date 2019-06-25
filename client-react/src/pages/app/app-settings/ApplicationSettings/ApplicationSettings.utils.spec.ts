import { getErrorMessage, formAppSettingToUseSlotSetting, formAppSettingToUseStickySetting } from './ApplicationSettings.utils';
describe('getErrorMessage', () => {
  it('Should validate true in valid app settings object', () => {
    const appSettings = JSON.stringify([
      {
        name: 'WEBSITE_NODE_DEFAULT_VERSION',
        value: '6.9.1',
        slotSetting: false,
      },
      {
        name: 'MSDEPLOY_RENAME_LOCKED_FILES',
        value: '1',
        slotSetting: false,
      },
    ]);
    const errMessage = getErrorMessage(appSettings, false, (key => key) as any);
    expect(errMessage).toBeFalsy();
  });

  it('Should validate true in valid app settings object without slotSetting', () => {
    const appSettings = JSON.stringify([
      {
        name: 'WEBSITE_NODE_DEFAULT_VERSION',
        value: '6.9.1',
      },
      {
        name: 'MSDEPLOY_RENAME_LOCKED_FILES',
        value: '1',
      },
    ]);
    const errMessage = getErrorMessage(appSettings, false, (key => key) as any);
    expect(errMessage).toBeFalsy();
  });
  it('Should give error message if object is put in', () => {
    const appSettings = JSON.stringify({
      name: 'WEBSITE_NODE_DEFAULT_VERSION',
      value: '6.9.1',
      slotSetting: false,
    });
    const errMessage = getErrorMessage(appSettings, false, (key => key) as any);
    expect(errMessage).toBe('appSettingValuesMustBeAnArray');
  });

  it('Should give error message if an object is missing a name', () => {
    const appSettings = JSON.stringify([
      {
        value: '6.9.1',
        slotSetting: false,
      },
      {
        name: 'MSDEPLOY_RENAME_LOCKED_FILES',
        value: '1',
        slotSetting: false,
      },
    ]);
    const errMessage = getErrorMessage(appSettings, false, (key => key) as any);
    expect(errMessage).toBe('appSettingPropIsRequired');
  });

  it('Should give error message if an object is missing a value', () => {
    const appSettings = JSON.stringify([
      {
        name: 'WEBSITE_NODE_DEFAULT_VERSION',
        slotSetting: false,
      },
      {
        name: 'MSDEPLOY_RENAME_LOCKED_FILES',
        value: '1',
        slotSetting: false,
      },
    ]);
    const errMessage = getErrorMessage(appSettings, false, (key => key) as any);
    expect(errMessage).toBe('appSettingPropIsRequired');
  });

  it('Should give error message if an object has a non string value', () => {
    const appSettings = JSON.stringify([
      {
        name: 'WEBSITE_NODE_DEFAULT_VERSION',
        value: 'test',
        slotSetting: false,
      },
      {
        name: 'MSDEPLOY_RENAME_LOCKED_FILES',
        value: 1,
        slotSetting: false,
      },
    ]);
    const errMessage = getErrorMessage(appSettings, false, (key => key) as any);
    expect(errMessage).toBe('appSettingValueMustBeAString');
  });

  it('Should give error message if an object has a non string name', () => {
    const appSettings = JSON.stringify([
      {
        name: 'WEBSITE_NODE_DEFAULT_VERSION',
        value: 'test',
        slotSetting: false,
      },
      {
        name: false,
        value: '1',
        slotSetting: false,
      },
    ]);
    const errMessage = getErrorMessage(appSettings, false, (key => key) as any);
    expect(errMessage).toBe('appSettingValueMustBeAString');
  });

  it('Should give error message if an object has extra properties', () => {
    const appSettings = JSON.stringify([
      {
        name: 'WEBSITE_NODE_DEFAULT_VERSION',
        value: '6.9.1',
        testName: 'test',
        slotSetting: false,
      },
      {
        name: 'MSDEPLOY_RENAME_LOCKED_FILES',
        value: '1',
        slotSetting: false,
      },
    ]);
    const errMessage = getErrorMessage(appSettings, false, (key => `${key}:{0}`) as any);
    expect(errMessage).toBe('invalidAppSettingProperty:testName');
  });

  it('Should give error message if slot setting is something other than a boolean', () => {
    const appSettings = JSON.stringify([
      {
        name: 'WEBSITE_NODE_DEFAULT_VERSION',
        value: 'test',
        slotSetting: 'test',
      },
      {
        name: 'test',
        value: '1',
        slotSetting: false,
      },
    ]);
    const errMessage = getErrorMessage(appSettings, false, (key => key) as any);
    expect(errMessage).toBe('slotSettingMustBeBoolean');
  });

  it('Should give error message if invalid json is given', () => {
    const appSettings = `[
      {
        name: 'WEBSITE_NODE_DEFAULT_VERSION',
        value: 'test',
        slotSetting: odfinsdnfsndonf,
      },
      {
        name: false,
        value: '1',
        slotSetting: false,
      },
    ]`;
    const errMessage = getErrorMessage(appSettings, false, (key => key) as any);
    expect(errMessage).toBe('jsonInvalid');
  });
});

describe('formAppSettingToUseSlotSetting', () => {
  it('Should swap sticky property to be slotSetting', () => {
    const testVal = [
      {
        name: 'test',
        value: 'testVal',
        sticky: true,
      },
    ];

    const testOut = formAppSettingToUseSlotSetting(testVal);
    expect(testOut).toEqual(
      JSON.stringify(
        [
          {
            name: 'test',
            value: 'testVal',
            slotSetting: true,
          },
        ],
        null,
        2
      )
    );
  });
});

describe('formAppSettingToUseStickySetting', () => {
  it('Should slotSetting property to be sticky', () => {
    const testVal = JSON.stringify([
      {
        name: 'test',
        value: 'testVal',
        slotSetting: true,
      },
    ]);

    const testOut = formAppSettingToUseStickySetting(testVal);
    expect(testOut).toEqual([
      {
        name: 'test',
        value: 'testVal',
        sticky: true,
      },
    ]);
  });
});
