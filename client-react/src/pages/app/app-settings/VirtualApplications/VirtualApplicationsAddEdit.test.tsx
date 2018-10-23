import { shallow } from 'enzyme';
import * as React from 'react';
import VirtualApplicationsAddEdit from './VirtualApplicationsAddEdit';
const VirtualApplicationsAddEditAny = VirtualApplicationsAddEdit as any;
describe('Virtual Applications Add/Edit', () => {
  describe('Shallow Testing', () => {
    let container;

    beforeEach(() => {
      container = shallow(<VirtualApplicationsAddEditAny values={{ virtualApplications: [] }} />);
    });

    it('renders without crashing', () => {
      expect(container.length).toBe(1);
    });
  });
});
