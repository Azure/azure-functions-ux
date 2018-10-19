import { shallow } from 'enzyme';
import * as React from 'react';
import { AppServiceRouter } from './AppServiceRouter';

describe('App Service Router', () => {
  const mockUpdateResourceIdCall = jest.fn();
  const subId = 'testsub';
  const rg = 'testrg';
  const site = 'sitename';
  const slot = 'slotname';
  describe('sites', () => {
    let container;
    beforeEach(() => {
      container = shallow(
        <AppServiceRouter updateResourceId={mockUpdateResourceIdCall} subscriptionId={subId} resourcegroup={rg} siteName={site} />
      );
    });
    afterEach(() => {
      mockUpdateResourceIdCall.mockReset();
    });
    it('renders without crashing', () => {
      expect(container.length).toEqual(1);
    });

    it('should render correctly', () => {
      expect(container).toMatchSnapshot('site-name-only');
    });

    it('calls update resourceId', () => {
      expect(mockUpdateResourceIdCall).toHaveBeenCalledWith(
        `/subscriptions/${subId}/resourcegroups/${rg}/providers/Microsoft.Web/sites/${site}`
      );
    });
  });

  describe('slots', () => {
    let container;
    beforeEach(() => {
      container = shallow(
        <AppServiceRouter
          updateResourceId={mockUpdateResourceIdCall}
          subscriptionId={subId}
          resourcegroup={rg}
          siteName={site}
          slotName={slot}
        />
      );
    });
    afterEach(() => {
      mockUpdateResourceIdCall.mockReset();
    });
    it('renders without crashing', () => {
      expect(container.length).toEqual(1);
    });

    it('should render correctly', () => {
      expect(container).toMatchSnapshot('site-and-slot-only');
    });

    it('calls update resourceId', () => {
      expect(mockUpdateResourceIdCall).toHaveBeenCalledWith(
        `/subscriptions/${subId}/resourcegroups/${rg}/providers/Microsoft.Web/sites/${site}/slots/${slot}`
      );
    });
  });
});
