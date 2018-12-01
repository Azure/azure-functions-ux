import { IAction } from '../../models/action';
import { IStartupInfo } from '../../models/portal-models';
import { GET_STARTUP_INFO, SETUP_IFRAME, UPDATE_THEME, UPDATE_TOKEN } from './portal-service-actions';
import lightTheme from '../../theme/light';
import { ThemeExtended } from 'src/theme/SemanticColorsExtended';

export interface IPortalServiceState {
  shellSrc: string;
  theme: ThemeExtended;
  startupInfo: IStartupInfo | null;
}

export const InitialState: IPortalServiceState = {
  shellSrc: '',
  theme: lightTheme as ThemeExtended,
  startupInfo: null,
};

const portalService = (state = InitialState, action: IAction<any>): IPortalServiceState => {
  switch (action.type) {
    case SETUP_IFRAME:
      return { ...state, shellSrc: action.payload.shellSrc };
    case UPDATE_THEME:
      return { ...state, theme: action.payload };
    case GET_STARTUP_INFO:
      return { ...state, startupInfo: action.payload.startupInfo };
    case UPDATE_TOKEN:
      return { ...state, startupInfo: { ...state.startupInfo!, token: action.payload } };
    default:
      return state;
  }
};

export default portalService;
