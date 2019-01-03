import { combineReducers } from 'redux';
import { ActionType } from 'typesafe-actions';

import { IStartupInfo } from '../../models/portal-models';
import lightTheme from '../../theme/light';
import { ThemeExtended } from '../../theme/SemanticColorsExtended';
import * as actions from './actions';
import { GET_STARTUP_INFO, SETUP_IFRAME, UPDATE_THEME, UPDATE_TOKEN } from './actionTypes';

export type PortalAction = ActionType<typeof actions>;
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

export default combineReducers<IPortalServiceState, PortalAction>({
  shellSrc: (state = InitialState.shellSrc, action) => {
    switch (action.type) {
      case SETUP_IFRAME:
        return action.shellSrc;
      default:
        return state;
    }
  },
  theme: (state = InitialState.theme, action) => {
    switch (action.type) {
      case UPDATE_THEME:
        return action.theme;
      default:
        return state;
    }
  },
  startupInfo: (state = InitialState.startupInfo, action) => {
    switch (action.type) {
      case GET_STARTUP_INFO:
        return action.startupInfo;
      case UPDATE_TOKEN:
        return { ...state!, token: action.token };
      default:
        return state;
    }
  },
});
