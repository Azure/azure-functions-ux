import { shallow } from 'enzyme';
import * as React from 'react';
import AppSettingsForm from './AppSettingsForm';
const AppSettingsFormAny = AppSettingsForm as any;
describe('App Settings', () => {
  describe('Shallow Testing', () => {
    let container;

    beforeEach(() => {
      container = shallow(<AppSettingsFormAny />);
    });

    it('renders without crashing', () => {
      expect(container.length).toBe(1);
    });
  });
});
