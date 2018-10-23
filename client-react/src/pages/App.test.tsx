import { shallow } from 'enzyme';
import * as React from 'react';
import ConnectedApp, { App } from './App';
import configureStore from 'redux-mock-store';

const mockStore = configureStore();
describe('Top Level App', () => {
  describe('shallow', () => {
    let container;
    beforeEach(() => {
      container = shallow(<App theme="dark" />);
    });

    it('renders without crashing', () => {
      expect(container.length).toEqual(1);
    });
  });
  describe('Maps State To Props', () => {
    it('passes correct theme when theme is there', () => {
      const state = {
        portalService: {
          startupInfo: {
            theme: 'dark',
          },
        },
      };
      const store = mockStore(state);
      const container = shallow(<ConnectedApp />, { context: { store } }).find(App);
      expect(container.prop('theme')).toBe('dark');
    });
    it("passes undefined when it's not but still renders", () => {
      const state = {
        portalService: {
          startupInfo: {},
        },
      };
      const store = mockStore(state);
      const container = shallow(<ConnectedApp />, { context: { store } }).find(App);
      expect(container.prop('theme')).toBeUndefined();
      expect(container.length).toEqual(1);
    });
  });
});
