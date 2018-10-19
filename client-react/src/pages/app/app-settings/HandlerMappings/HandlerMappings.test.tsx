import { shallow } from 'enzyme';
import * as React from 'react';
import HandlerMappings from './HandlerMappings';
const HandlerMappingsAny = HandlerMappings as any;
describe('Handler Mappings Table', () => {
  describe('Shallow Testing', () => {
    let container;

    beforeEach(() => {
      container = shallow(<HandlerMappingsAny values={{}} />);
    });

    it('renders without crashing', () => {
      expect(container.length).toBe(1);
    });

    it('render matches snapshot', () => {
      expect(container).toMatchSnapshot('DefaultSnapshot');
    });
  });
});
