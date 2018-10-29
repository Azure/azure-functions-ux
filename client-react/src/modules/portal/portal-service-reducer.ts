import { IAction } from '../../models/action';
import { IStartupInfo } from '../../models/portal-models';
import { ITheme } from 'office-ui-fabric-react/lib-commonjs/Styling';
import { GET_STARTUP_INFO, SETUP_IFRAME, UPDATE_THEME } from './portal-service-actions';
import lightTheme from '../../theme/light';

export interface IPortalServiceState {
  shellSrc: string;
  theme: ITheme;
  startupInfo: IStartupInfo | null;
}

export const InitialState: IPortalServiceState = {
  shellSrc: '',
  theme: lightTheme as ITheme,
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
    default:
      return state;
  }
};

export default portalService;
