import { IAction } from '../../../../models/action';
import { ArmObj } from '../../../../models/WebAppModels';

export const UPDATE_SITE_CONFIG_METADATA = 'UPDATE_SITE_CONFIG_METADATA';
export const updateCurrentSiteMetadataConfig = (site: ArmObj<{ [key: string]: string }>): IAction<ArmObj<{ [key: string]: string }>> => ({
  payload: site,
  type: UPDATE_SITE_CONFIG_METADATA,
});

export const UPDATE_SITE_CONFIG_METADATA_LOADING = 'UPDATE_SITE_CONFIG_METADATA_LOADING';
export const updateSiteConfigMetadataLoading = (loading: boolean): IAction<boolean> => ({
  payload: loading,
  type: UPDATE_SITE_CONFIG_METADATA_LOADING,
});

export const UPDATE_SITE_CONFIG_METADATA_SAVING = 'UPDATE_SITE_CONFIG_METADATA_SAVING';
export const updateSiteConfigMetadataSaving = (saving: boolean): IAction<boolean> => ({
  payload: saving,
  type: UPDATE_SITE_CONFIG_METADATA_SAVING,
});
