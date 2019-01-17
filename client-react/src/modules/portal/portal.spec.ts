import { IStartupInfo } from '../../models/portal-models';
import darkModeTheme from '../../theme/dark';
import lightTheme from '../../theme/light';
import { ThemeExtended } from '../../theme/SemanticColorsExtended';
import { getStartupInfoAction, setupIFrameAction, updateTheme, updateToken } from './actions';
import reducer, { IPortalServiceState } from './reducer';

const testStartupInfo: IStartupInfo = {
  token: 'testtoken',
} as IStartupInfo;
describe('Startup Info State', () => {
  let initialState: IPortalServiceState;
  beforeEach(() => {
    initialState = reducer(undefined, {} as any);
  });
  describe('initial state', () => {
    it('initial state matches snapshot', () => {
      expect(initialState.startupInfo).toBe(null);
      expect(initialState.theme).toBe(lightTheme);
      expect(initialState.shellSrc).toBe('');
    });
  });

  describe('State updates', () => {
    it('Setup IFrame Action', () => {
      const state = reducer(initialState, setupIFrameAction('newshellsrc'));
      expect(state.shellSrc).toBe('newshellsrc');
    });

    it('get Startup Info Action', () => {
      const state = reducer(initialState, getStartupInfoAction(testStartupInfo));
      expect(state.startupInfo).toBe(testStartupInfo);
    });

    it('get Startup Info Action', () => {
      const state = reducer(initialState, getStartupInfoAction(testStartupInfo));
      expect(state.startupInfo).toBe(testStartupInfo);
    });
    it('get Theme', () => {
      const state = reducer(initialState, updateTheme(darkModeTheme as ThemeExtended));
      expect(state.theme).toBe(darkModeTheme);
    });

    it('refresh token', () => {
      const state = reducer(initialState, updateToken('newToken'));
      expect(state.startupInfo).not.toBe(null);
      expect(state.startupInfo!.token).toBe('newToken');
    });
  });
});
