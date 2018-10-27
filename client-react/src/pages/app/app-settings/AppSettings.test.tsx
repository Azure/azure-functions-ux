import { shallow, ShallowWrapper } from 'enzyme';
import * as React from 'react';
import { AppSettings } from './AppSettings';
import mockState from '../../../mocks/mockState';
describe('App Settings', () => {
  describe('Shallow Testing', () => {
    let container: ShallowWrapper<any, any, AppSettings>;
    const fetchSite = jest.fn().mockImplementation(() => {
      return Promise.resolve({
        site: {
          kind: 'app',
        },
      });
    });
    const fetchSettings = jest.fn();
    const fetchConfig = jest.fn();
    const fetchCNStrings = jest.fn();
    const fetchStacks = jest.fn();
    const updateConfig = jest.fn();
    const updateSite = jest.fn();

    beforeEach(() => {
      container = shallow(
        <AppSettings
          fetchSite={fetchSite}
          fetchSettings={fetchSettings}
          fetchConfig={fetchConfig}
          fetchConnStrings={fetchCNStrings}
          fetchStacks={fetchStacks}
          site={mockState.site.site}
          appSettings={mockState.appSettings.settings}
          virtualApplications={mockState.webConfig.virtualApplications}
          config={mockState.webConfig.config}
          connectionStrings={mockState.connectionStrings.connectionStrings}
          currentlySelectedStack={mockState.webConfig.currentlySelectedStack}
          updateConfig={updateConfig}
          updateSite={updateSite}
        />
      );
    });

    afterEach(() => {
      updateConfig.mockReset();
    });
    it('renders without creashing', () => {
      expect(container.length).toEqual(1);
    });

    it('dispatches fetch calls on load', () => {
      expect(fetchSettings).toBeCalled();
      expect(fetchConfig).toBeCalled();
      expect(fetchCNStrings).toBeCalled();
    });

    it('submit calls update site and update config', () => {
      expect(updateSite).not.toHaveBeenCalled();
      expect(updateConfig).not.toHaveBeenCalled();
      const values = container.instance().initialValues(container.props());
      container.instance().onSubmit(values, { setSubmitting: jest.fn() } as any);
      expect(updateSite).toHaveBeenCalled();
      expect(updateConfig).toHaveBeenCalled();
    });

    it('submit calls set submitting to true while submitting', () => {
      const values = container.instance().initialValues(container.props());
      container.instance().onSubmit(values, { setSubmitting: jest.fn() } as any);
      expect(container.state('isSubmitting')).toBeTruthy();
    });

    it('isSubmitting is set to false when completed', async () => {
      const values = container.instance().initialValues(container.props());
      await container.instance().onSubmit(values, { setSubmitting: jest.fn() } as any);
      expect(container.state('isSubmitting')).toBeFalsy();
    });
  });
});
