import { shallow } from 'enzyme';
import * as React from 'react';
import VirtualApplications from './VirtualApplications';
const VirtualApplicationsAny = VirtualApplications as any;
describe('Virtual Applications Table', () => {
  describe('Shallow Testing', () => {
    let container;

    beforeEach(() => {
      container = shallow(<VirtualApplicationsAny values={{ virtualApplications: [] }} />);
    });

    it('renders without crashing', () => {
      expect(container.length).toBe(1);
    });

    it('render matches snapshot', () => {
      expect(container).toMatchSnapshot('DefaultSnapshot');
    });
  });
});
