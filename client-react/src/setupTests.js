import 'jest-date-mock';
import './polyfills/string';

jest.doMock('react-i18next', () => ({
  // this mock makes sure any components using the translate HoC receive the t function as a prop
  translate: () => Component => {
    Component.defaultProps = {
      ...Component.defaultProps,
      t: () => '',
    };
    return Component;
  },
}));
