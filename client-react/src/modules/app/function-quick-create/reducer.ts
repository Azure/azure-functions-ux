import { IAction } from '../../../models/action';
// import { cSharpCode } from '../../../pages/app/function-quick-create/components/header-form';
import {
  UPDATE_CURRENT_CODE,
  UPDATE_FUNCTION_APP_LANGUAGE,
  UPDATE_FUNCTION_APP_LANGUAGE_AND_CODE,
  UPDATE_FUNCTION_APP_NAME,
  UPDATE_IS_SUBMITTING,
} from './actions';

export interface IFunctionQuickCreateState {
  // code: string;
  functionAppName: string;
  functionAppLanguage: string;
  isSubmitting: boolean;
}

export const InitialState: IFunctionQuickCreateState = {
  // code: cSharpCode,
  functionAppName: '',
  functionAppLanguage: 'csharp',
  isSubmitting: false,
};

const functionQuickCreate = (state = InitialState, action: IAction<any>) => {
  switch (action.type) {
    case UPDATE_CURRENT_CODE:
      return { ...state, ...action.payload };
    case UPDATE_FUNCTION_APP_NAME:
      return { ...state, ...action.payload };
    case UPDATE_FUNCTION_APP_LANGUAGE:
      return { ...state, ...action.payload };
    case UPDATE_FUNCTION_APP_LANGUAGE_AND_CODE:
      return { ...state, ...action.payload };
    case UPDATE_IS_SUBMITTING:
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

export default functionQuickCreate;
