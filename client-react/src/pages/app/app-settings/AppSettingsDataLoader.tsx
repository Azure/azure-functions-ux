import { FormikActions } from 'formik';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { bindActionCreators, Dispatch } from 'redux';

import { fetchStacksRequest, StacksOS } from '../../../modules/service/available-stacks/actions';
import { fetchPermissions, PermissionCheckObj } from '../../../modules/service/rbac/thunks';
import { fetchSiteRequest, updateSiteRequest } from '../../../modules/site/actions';
import { fetchAppSettingsRequest } from '../../../modules/site/config/appsettings/actions';
import { AppSettingsState } from '../../../modules/site/config/appsettings/reducer';
import { fetchConnectionStringsRequest } from '../../../modules/site/config/connectionstrings/actions';
import { ConnectionStringState } from '../../../modules/site/config/connectionstrings/reducer';
import { fetchMetadataRequest } from '../../../modules/site/config/metadata/actions';
import { MetadataState } from '../../../modules/site/config/metadata/reducer';
import { fetchSlotConfigRequest, updateSlotConfigRequest } from '../../../modules/site/config/slotConfigNames/actions';
import { SlotConfigNamesState } from '../../../modules/site/config/slotConfigNames/reducer';
import { fetchWebConfigRequest, updateWebConfigRequest } from '../../../modules/site/config/web/actions';
import { ConfigStateType } from '../../../modules/site/config/web/reducer';
import { SiteState } from '../../../modules/site/reducer';
import { RootAction, RootState } from '../../../modules/types';
import { AppSettingsFormValues } from './AppSettings.types';
import { convertStateToForm, convertFormToState } from './AppSettingsFormData';
import { ArmObj, Site, SiteConfig, SlotConfigNames } from '../../../models/WebAppModels';

export interface AppSettingsDataLoaderProps {
  children: (
    props: {
      initialFormValues: AppSettingsFormValues;
      saving: boolean;
      loading: boolean;
      onSubmit: (values: AppSettingsFormValues, actions: FormikActions<AppSettingsFormValues>) => void;
    }
  ) => JSX.Element;
  fetchSite: () => void;
  fetchStacks: (osType: StacksOS) => void;
  fetchAppSettings: () => void;
  fetchConfig: () => void;
  fetchMetadata: () => void;
  fetchSlotConfigNames: () => void;
  fetchConnectionStrings: () => void;
  fetchPermissions: (resources: PermissionCheckObj[]) => void;
  updateSite: (site: ArmObj<Site>) => void;
  updateConfig: (config: ArmObj<SiteConfig>) => void;
  updateSlotConfig: (slotNames: ArmObj<SlotConfigNames>) => void;
  resourceId: string;
  site: SiteState;
  config: ConfigStateType;
  appSettings: AppSettingsState;
  connectionStrings: ConnectionStringState;
  metadata: MetadataState;
  slotConfigNames: SlotConfigNamesState;
  siteWritePermission: boolean;
}

// `state` parameter needs a type annotation to type-check the correct shape of a state object but also it'll be used by "type inference" to infer the type of returned props

const AppSettingsDataLoader: React.SFC<AppSettingsDataLoaderProps> = props => {
  const {
    fetchAppSettings,
    fetchConfig,
    fetchConnectionStrings,
    fetchSite,
    fetchPermissions,
    fetchMetadata,
    fetchSlotConfigNames,
    resourceId,
    fetchStacks,
    metadata,
    slotConfigNames,
    updateConfig,
    updateSite,
    updateSlotConfig,
  } = props;

  const onSubmit = (values: AppSettingsFormValues, actions: FormikActions<AppSettingsFormValues>) => {
    const newValues = convertFormToState(values, metadata.data, slotConfigNames.data);
    updateSite(newValues.site);
    updateConfig(newValues.config);
    newValues.slotConfigNames && updateSlotConfig(newValues.slotConfigNames);
  };

  useEffect(() => {
    fetchAppSettings();
    fetchConfig();
    fetchConnectionStrings();
    fetchSite();
    fetchMetadata();
    fetchSlotConfigNames();
    fetchPermissions([{ resourceId: resourceId, action: './write' }]);
  }, []);

  useEffect(
    () => {
      const { kind } = props.site.data;

      if (kind) {
        let os: StacksOS = 'Windows';
        if (kind.includes('linux')) {
          os = 'Linux';
        }
        fetchStacks(os);
      }
    },
    [props.site.data.id]
  );
  if (isSaving(props)) {
    return <div>Saving</div>;
  }
  return (
    <>{props.children({ onSubmit, initialFormValues: convertStateToForm(props), saving: isSaving(props), loading: isLoading(props) })}</>
  );
};

const isLoading = (props: AppSettingsDataLoaderProps) => {
  const { site, config, appSettings, metadata, connectionStrings, slotConfigNames } = props;
  return (
    site.metadata.loading ||
    config.metadata.loading ||
    appSettings.metadata.loading ||
    metadata.metadata.loading ||
    connectionStrings.metadata.loading ||
    slotConfigNames.metadata.loading
  );
};

const isSaving = (props: AppSettingsDataLoaderProps) => {
  const { site, config, appSettings, metadata, connectionStrings, slotConfigNames } = props;
  return (
    site.metadata.updating ||
    config.metadata.updating ||
    appSettings.metadata.updating ||
    metadata.metadata.updating ||
    connectionStrings.metadata.updating ||
    slotConfigNames.metadata.updating
  );
};

const mapStateToProps = (state: RootState) => {
  const siteWriteKey = `${state.site.resourceId}|./write`;
  return {
    resourceId: state.site.resourceId,
    site: state.site,
    config: state.webConfig,
    appSettings: state.appSettings,
    connectionStrings: state.connectionStrings,
    metadata: state.metadata,
    slotConfigNames: state.slotConfigNames,
    siteWritePermission: state.rbac.permissions[siteWriteKey],
  };
};

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) =>
  bindActionCreators(
    {
      fetchSite: fetchSiteRequest,
      fetchAppSettings: fetchAppSettingsRequest,
      fetchConnectionStrings: fetchConnectionStringsRequest,
      fetchConfig: fetchWebConfigRequest,
      fetchStacks: fetchStacksRequest,
      fetchMetadata: fetchMetadataRequest,
      fetchSlotConfigNames: fetchSlotConfigRequest,
      fetchPermissions: fetchPermissions,
      updateSite: updateSiteRequest,
      updateConfig: updateWebConfigRequest,
      updateSlotConfig: updateSlotConfigRequest,
    },
    dispatch
  );

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(AppSettingsDataLoader);
