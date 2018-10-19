import { IAction } from '../../../models/action';

export const UPDATE_CURRENT_CODE = 'UPDATE_CURRENT_CODE';
export const UPDATE_FUNCTION_APP_NAME = 'UPDATE_FUNCTION_APP_NAME';
export const UPDATE_FUNCTION_APP_LANGUAGE = 'UPDATE_FUNCTION_APP_LANGUAGE';
export const UPDATE_FUNCTION_APP_LANGUAGE_AND_CODE = 'UPDATE_FUNCTION_APP_LANGUAGE_AND_CODE';
export const UPDATE_IS_SUBMITTING = 'UPDATE_FUNCTION_APP_LANGUAGE_AND_CODE';

export interface IUpdateCodeModel {
  code: string;
}

export const updateCurrentCode = (code: string): IAction<IUpdateCodeModel> => ({
  payload: {
    code,
  },
  type: UPDATE_CURRENT_CODE,
});

export interface IUpdateFunctionAppNameModel {
  functionAppName: string;
}
export const updateFunctionAppName = (functionAppName: string): IAction<IUpdateFunctionAppNameModel> => ({
  payload: {
    functionAppName,
  },
  type: UPDATE_FUNCTION_APP_NAME,
});

export interface IUpdateFunctionAppLanguageModel {
  functionAppLanguage: string;
}
export const updateFunctionAppLanguage = (functionAppLanguage: string): IAction<IUpdateFunctionAppLanguageModel> => ({
  payload: {
    functionAppLanguage,
  },
  type: UPDATE_FUNCTION_APP_LANGUAGE,
});

export interface IUpdateFunctionAppLanguageAndCodeModel {
  functionAppLanguage: string;
  code: string;
}
export const updateFunctionAppLanguageAndCode = (
  functionAppLanguage: string,
  code: string
): IAction<IUpdateFunctionAppLanguageAndCodeModel> => ({
  payload: {
    functionAppLanguage,
    code,
  },
  type: UPDATE_FUNCTION_APP_LANGUAGE_AND_CODE,
});

export interface IUpdateIsSubmittingModel {
  isSubmitting: boolean;
}
export const updateIsSubmitting = (isSubmitting: boolean): IAction<IUpdateIsSubmittingModel> => ({
  payload: {
    isSubmitting,
  },
  type: UPDATE_IS_SUBMITTING,
});
