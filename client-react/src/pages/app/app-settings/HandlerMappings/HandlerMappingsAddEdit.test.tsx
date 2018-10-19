import { shallow } from 'enzyme';
import * as React from 'react';
import HandlerMappingsAddEdit from './HandlerMappingsAddEdit';
const HandlerMappingsAddEditAny = HandlerMappingsAddEdit as any;
describe('Handler Mappings Add Edit', () => {
  describe('Shallow Testing', () => {
    let container;

    beforeEach(() => {
      container = shallow(<HandlerMappingsAddEditAny />);
    });

    it('renders without crashing', () => {
      expect(container.length).toBe(1);
    });

    it('render matches snapshot', () => {
      expect(container).toMatchSnapshot('DefaultSnapshot');
    });
  });
});
